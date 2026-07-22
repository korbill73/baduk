import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameMode, BoardSize, StoneColor, Point, RankInfo, AiRecommendation, TerritoryMap } from './types/go';
import { GoBoard } from './core/GoBoard';
import { ScoringEngine } from './core/Scoring';
import { RANKS_DATA } from './data/tsumegoPuzzles';
import { Header } from './components/Header/Header';
import { BoardCanvas } from './components/Board/BoardCanvas';
import { TerritoryOverlay } from './components/Board/TerritoryOverlay';
import { GameStatus } from './components/ControlPanel/GameStatus';
import { AiCoachPanel } from './components/ControlPanel/AiCoachPanel';
import { RankSelector } from './components/ControlPanel/RankSelector';
import { AiEngineModal } from './components/ControlPanel/AiEngineModal';
import { TsumegoModal } from './components/Tsumego/TsumegoModal';
import { LoginModal } from './components/Auth/LoginModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { firebaseBridge } from './core/FirebaseService';
import { ScoringModal } from './components/Scoring/ScoringModal';
import { KataGoBridge } from './ai/KataGoBridge';
import { MCTSEngine } from './ai/MCTS';
import { soundManager } from './sound/SoundManager';
import { UserProfileService } from './core/UserProfileService';
import { peerConnectionManager } from './core/PeerConnectionManager';
import { UserProfileModal } from './components/Profile/UserProfileModal';
import { OnlinePvpModal } from './components/Online/OnlinePvpModal';
import { OnlineChatPanel } from './components/Online/OnlineChatPanel';
import type { UserProfile, PvpMessage, MovePayload } from './types/pvp';

export function App() {
  const [mode, setMode] = useState<GameMode>('play');
  const [boardSize, setBoardSize] = useState<BoardSize>(19);
  const boardRef = useRef<GoBoard>(new GoBoard(19));
  
  // State variables for reactive re-render
  const [grid, setGrid] = useState<StoneColor[][]>(boardRef.current.grid);
  const [turn, setTurn] = useState<'black' | 'white'>('black');
  const [userColor] = useState<'black' | 'white'>('black');
  const [aiRank, setAiRank] = useState<RankInfo>(RANKS_DATA[0]); // 기본 난이도: 18급 (입문)
  const [capturesBlack, setCapturesBlack] = useState(0);
  const [capturesWhite, setCapturesWhite] = useState(0);
  const [komi] = useState<number>(6.5);
  const [gameOver, setGameOver] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<Point | null>(null);
  
  const [isThinking, setIsThinking] = useState(false);
  const [showTerritory, setShowTerritory] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [territoryMap, setTerritoryMap] = useState<TerritoryMap | null>(null);
  const [showRankSelector, setShowRankSelector] = useState(false);
  const [showAiEngineModal, setShowAiEngineModal] = useState(false);
  const [isScoringOpen, setIsScoringOpen] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => UserProfileService.getProfile());

  // Listen to Firebase auth state
  useEffect(() => {
    return firebaseBridge.onUserChange(async (user) => {
      if (user) {
        setCurrentUser(user);
        const isOwnerAdmin = (user.email || '').toLowerCase().trim() === 'korbill73@gmail.com';
        setIsAdmin(isOwnerAdmin);
        try {
          const cloudProfile = await firebaseBridge.syncUserToDb(user);
          setUserProfile(cloudProfile);
          if (isOwnerAdmin) setIsAdmin(true);
        } catch (e) {
          console.error('Failed to sync user profile:', e);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        setUserProfile(UserProfileService.getProfile());
      }
    });
  }, []);
  const [opponentProfile, setOpponentProfile] = useState<UserProfile | null>(null);
  const [onlineAssignedColor, setOnlineAssignedColor] = useState<'black' | 'white'>('black');
  const [, setOnlineRoomCode] = useState<string>('');
  const [isBoardExpanded, setIsBoardExpanded] = useState(false);

  const handleLogout = async () => {
    try {
      await firebaseBridge.logout();
      setCurrentUser(null);
      setIsAdmin(false);
      setUserProfile(UserProfileService.getProfile());
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Web Worker ref
  const workerRef = useRef<Worker | null>(null);

  const updateStateFromBoard = useCallback(() => {
    const b = boardRef.current;
    setGrid(b.cloneGrid(b.grid));
    setTurn(b.turn);
    setCapturesBlack(b.capturesBlack);
    setCapturesWhite(b.capturesWhite);

    // Check if game just ended from double pass
    if (b.gameOver && !gameOver && !b.resultMessage?.includes('기권')) {
      setIsScoringOpen(true);
    }

    setGameOver(b.gameOver);
    setResultMessage(b.resultMessage);

    const currHistory = b.history[b.historyIndex];
    if (currHistory?.move && !currHistory.move.isPass && !currHistory.move.isResign) {
      setLastMove({ x: currHistory.move.x, y: currHistory.move.y });
    } else {
      setLastMove(null);
    }

    // Update real-time territory estimate
    const map = ScoringEngine.estimateTerritoryAndScore(b, komi);
    setTerritoryMap(map);
  }, [komi]);

  const handleNewGame = useCallback((newSize: BoardSize = boardSize) => {
    boardRef.current = new GoBoard(newSize);
    setRecommendations([]);
    setLastMove(null);
    setIsThinking(false);
    updateStateFromBoard();
  }, [boardSize, updateStateFromBoard]);

  // Initialize and clean up Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('./ai/badukAiWorker.ts', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, move, recommendations: recs, error } = e.data;
      if (type === 'MOVE_RESULT') {
        setIsThinking(false);
        if (move) {
          const b = boardRef.current;
          const oldCapturesBlack = b.capturesBlack;
          const oldCapturesWhite = b.capturesWhite;
          const played = b.playMove(move.x, move.y, b.turn);
          if (played) {
            soundManager.playStoneClick();
            if (b.capturesBlack > oldCapturesBlack || b.capturesWhite > oldCapturesWhite) {
              setTimeout(() => soundManager.playCapture(), 100);
            }
          }
        } else {
          // AI passes if no valid moves
          boardRef.current.passMove(boardRef.current.turn);
        }
        if (recs) setRecommendations(recs);
        updateStateFromBoard();
      } else if (type === 'HINTS_RESULT') {
        setIsThinking(false);
        if (recs) {
          setRecommendations(recs);
          setShowHints(true);
        }
      } else if (type === 'ERROR') {
        setIsThinking(false);
        console.error('AI Error:', error);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [updateStateFromBoard]);

  // Handle board size change
  const handleBoardSizeChange = (newSize: BoardSize) => {
    setBoardSize(newSize);
    handleNewGame(newSize);
  };

  // Trigger AI turn automatically when it is AI's turn in play mode
  useEffect(() => {
    if (mode === 'play' && !boardRef.current.gameOver && turn !== userColor && !isThinking) {
      setIsThinking(true);
      const b = boardRef.current;
      setTimeout(async () => {
        try {
          const historyMoves = b.history.map(item => item.move).filter((m): m is any => m !== null);
          const extResult = await KataGoBridge.queryKataGo(b.size, historyMoves, b.turn, false, aiRank, b.grid);
          if (extResult && extResult.move && b.canPlay(extResult.move.x, extResult.move.y, b.turn).valid) {
            b.playMove(extResult.move.x, extResult.move.y, b.turn);
            soundManager.playStoneClick();
            if (extResult.recommendations) setRecommendations(extResult.recommendations);
            updateStateFromBoard();
            setIsThinking(false);
          } else {
            console.warn('⚠️ 외부 KataGo 연결 지연 또는 미응답. 고성능 내장 MCTS AI 엔진으로 자동 폴백합니다.');
            const fallbackResult = MCTSEngine.runSearch(b, b.turn, aiRank);
            if (fallbackResult && fallbackResult.move && b.canPlay(fallbackResult.move.x, fallbackResult.move.y, b.turn).valid) {
              b.playMove(fallbackResult.move.x, fallbackResult.move.y, b.turn);
              soundManager.playStoneClick();
              if (fallbackResult.recommendations) setRecommendations(fallbackResult.recommendations);
              updateStateFromBoard();
            } else {
              b.passMove(b.turn);
              updateStateFromBoard();
            }
            setIsThinking(false);
          }
        } catch (err: any) {
          console.warn('AI 계산 중 예외 발생, 내장 AI로 자동 진행:', err);
          try {
            const fallbackResult = MCTSEngine.runSearch(b, b.turn, aiRank);
            if (fallbackResult && fallbackResult.move && b.canPlay(fallbackResult.move.x, fallbackResult.move.y, b.turn).valid) {
              b.playMove(fallbackResult.move.x, fallbackResult.move.y, b.turn);
              soundManager.playStoneClick();
              if (fallbackResult.recommendations) setRecommendations(fallbackResult.recommendations);
              updateStateFromBoard();
            }
          } catch (e) {}
          setIsThinking(false);
        }
      }, 350);
    }
  }, [turn, mode, userColor, aiRank, isThinking]);

  // Listen to incoming P2P messages during match
  useEffect(() => {
    const unsub = peerConnectionManager.onMessage((msg: PvpMessage) => {
      if (mode !== 'online') return;
      const b = boardRef.current;
      if (msg.type === 'MOVE' && msg.payload) {
        const payload = msg.payload as MovePayload;
        const validColor: 'black' | 'white' = payload.color === 'white' ? 'white' : 'black';
        const played = b.playMove(payload.x, payload.y, validColor);
        if (played) {
          soundManager.playStoneClick();
          updateStateFromBoard();
        }
      } else if (msg.type === 'PASS') {
        soundManager.playStoneClick();
        b.passMove(b.turn);
        updateStateFromBoard();
      } else if (msg.type === 'RESIGN') {
        soundManager.playError();
        UserProfileService.recordGameResult('online', 'win', opponentProfile?.nickname || '온라인 상대', onlineAssignedColor);
        setUserProfile(UserProfileService.getProfile());
        b.resign(b.turn);
        updateStateFromBoard();
      } else if (msg.type === 'UNDO_REQUEST') {
        b.undoMove();
        updateStateFromBoard();
        peerConnectionManager.sendMessage({ type: 'UNDO_ACCEPT' });
      } else if (msg.type === 'UNDO_ACCEPT') {
        b.undoMove();
        updateStateFromBoard();
      }
    });
    return unsub;
  }, [mode, onlineAssignedColor, opponentProfile, updateStateFromBoard]);

  // User places stone
  const handlePlaceStone = (x: number, y: number) => {
    if ((mode !== 'play' && mode !== 'pvp' && mode !== 'online') || isThinking || boardRef.current.gameOver) {
      return;
    }
    if (mode === 'play' && turn !== userColor) {
      return;
    }
    if (mode === 'online' && turn !== onlineAssignedColor) {
      soundManager.playError();
      return;
    }

    const b = boardRef.current;
    const rawColor = (mode === 'pvp' || mode === 'online') ? turn : userColor;
    if (!rawColor) return;
    const stoneColor: 'black' | 'white' = rawColor === 'white' ? 'white' : 'black';
    const check = b.canPlay(x, y, stoneColor);
    if (!check.valid) {
      soundManager.playError();
      return;
    }

    const oldCapturesBlack = b.capturesBlack;
    const oldCapturesWhite = b.capturesWhite;

    const success = b.playMove(x, y, stoneColor);
    if (success) {
      soundManager.playStoneClick();
      if (b.capturesBlack > oldCapturesBlack || b.capturesWhite > oldCapturesWhite) {
        setTimeout(() => soundManager.playCapture(), 100);
      }
      if (mode === 'online') {
        peerConnectionManager.sendMessage({
          type: 'MOVE',
          senderId: userProfile.id,
          payload: { x, y, color: stoneColor } as MovePayload
        });
      }
      // Clear previous hints
      setRecommendations([]);
      setShowHints(false);
      updateStateFromBoard();
    }
  };

  // Request hints manually
  const handleRequestHints = async () => {
    if (isThinking || boardRef.current.gameOver) return;
    setIsThinking(true);
    const b = boardRef.current;
    try {
      const historyMoves = b.history.map(item => item.move).filter((m): m is any => m !== null);
      const extResult = await KataGoBridge.queryKataGo(b.size, historyMoves, b.turn, false, aiRank, b.grid);
      if (extResult && extResult.recommendations && extResult.recommendations.length > 0) {
        setRecommendations(extResult.recommendations);
        setIsThinking(false);
      } else {
        setIsThinking(false);
        alert('⚠️ [KataGo 추천수 조회 실패]\n\nKT Cloud KataGo 서버에서 추천수를 반환하지 못했습니다. 서버가 실행 중이고 수신 파라미터를 정상 처리하는지 점검해주세요.');
      }
    } catch (e: any) {
      setIsThinking(false);
      alert(`⚠️ [KataGo 추천수 통신 예외]: ${e.message || e}`);
    }
  };

  const handleUndo = () => {
    if (mode === 'online') {
      peerConnectionManager.sendMessage({ type: 'UNDO_REQUEST' });
      return;
    }
    if (boardRef.current.undoMove()) {
      // Undo user move AND previous AI move if possible when playing vs AI
      if (mode === 'play' && boardRef.current.turn !== userColor) {
        boardRef.current.undoMove();
      }
      setRecommendations([]);
      updateStateFromBoard();
    }
  };

  const handleRedo = () => {
    if (boardRef.current.redoMove()) {
      updateStateFromBoard();
    }
  };

  const handlePass = () => {
    if ((mode === 'play' && turn === userColor) || mode === 'pvp' || mode === 'online') {
      if (mode === 'online' && turn !== onlineAssignedColor) return;
      if (mode === 'online') {
        peerConnectionManager.sendMessage({ type: 'PASS', senderId: userProfile.id });
      }
      boardRef.current.passMove(turn);
      updateStateFromBoard();
    }
  };

  const handleResign = () => {
    if (mode === 'play' || mode === 'pvp' || mode === 'online') {
      if (mode === 'online') {
        peerConnectionManager.sendMessage({ type: 'RESIGN', senderId: userProfile.id });
        UserProfileService.recordGameResult('online', 'loss', opponentProfile?.nickname || '온라인 상대', onlineAssignedColor);
        if (currentUser) {
          firebaseBridge.recordGameInCloud(currentUser.uid, 'online', 'loss', opponentProfile?.nickname || '온라인 상대', onlineAssignedColor, undefined, aiRank.name);
        }
        setUserProfile(UserProfileService.getProfile());
      } else {
        UserProfileService.recordGameResult(mode, 'loss', mode === 'play' ? aiRank.name : '1:1 상대', turn);
        if (currentUser) {
          const safeMode = (mode === 'play' || mode === 'pvp' || mode === 'online') ? mode : 'play';
          firebaseBridge.recordGameInCloud(currentUser.uid, safeMode, 'loss', mode === 'play' ? aiRank.name : '1:1 상대', turn, undefined, aiRank.name);
        }
        setUserProfile(UserProfileService.getProfile());
      }
      boardRef.current.resign(turn);
      updateStateFromBoard();
    }
  };

  const handleJumpToHistory = (index: number) => {
    if (boardRef.current.jumpToHistory(index)) {
      updateStateFromBoard();
    }
  };

  const handleStartOnlineMatch = (myColor: StoneColor, opponent: UserProfile, code: string) => {
    const finalColor: 'black' | 'white' = myColor === 'white' ? 'white' : 'black';
    setOnlineAssignedColor(finalColor);
    setOpponentProfile(opponent);
    setOnlineRoomCode(code);
    setIsOnlineModalOpen(false);
    setMode('online');
    boardRef.current = new GoBoard(19);
    setRecommendations([]);
    setLastMove(null);
    updateStateFromBoard();
  };

  return (
    <div className="app-main-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: isBoardExpanded ? '0.3rem 1.2rem 0.5rem 1.2rem' : '0.5rem 1.2rem 0.6rem 1.2rem', transition: 'padding 0.3s' }}>
      {!isBoardExpanded && (
        <Header
          mode={mode}
          setMode={setMode}
          boardSize={boardSize}
          setBoardSize={handleBoardSizeChange}
          aiRank={aiRank}
          onOpenRankSelector={() => setShowRankSelector(true)}
          onOpenAiEngineModal={() => setShowAiEngineModal(true)}
          onOpenOnlineModal={() => setIsOnlineModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenLoginModal={() => setShowLoginModal(true)}
          onOpenAdminDashboard={() => setShowAdminDashboard(true)}
          currentUser={currentUser}
          isAdmin={isAdmin}
          myNickname={userProfile.nickname}
          myRankTitle={userProfile.rankTitle}
          onLogout={handleLogout}
          onNewGame={() => handleNewGame()}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          isBoardExpanded={isBoardExpanded}
          onToggleBoardExpand={() => setIsBoardExpanded(prev => !prev)}
        />
      )}

      {/* Main Grid Area (Mobile responsive single column on phone screens via CSS) */}
      <main className={`main-grid-layout ${mode === 'tsumego' ? 'tsumego' : isBoardExpanded ? 'expanded' : ''}`}>
        {mode !== 'tsumego' ? (
          <>
            {/* Left Column: Board Canvas ONLY (prevents any vertical shifting when stones are placed) */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
              {isThinking && (
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 200,
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.96))',
                  border: `2px solid ${aiRank.badgeColor || '#38bdf8'}`,
                  borderRadius: '35px',
                  padding: '0.5rem 1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  boxShadow: `0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px ${aiRank.badgeColor || '#38bdf8'}55`,
                  backdropFilter: 'blur(12px)',
                  animation: 'pulse 1.6s infinite ease-in-out',
                  pointerEvents: 'none'
                }}>
                  <span style={{ fontSize: '1.2rem', animation: 'bounce 1s infinite' }}>🤖</span>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>KataGo AI 생각 중...</span>
                    <strong style={{ color: aiRank.badgeColor || '#38bdf8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                      {aiRank.name} 수읽기
                    </strong>
                  </span>
                </div>
              )}
              <BoardCanvas
                size={boardSize}
                grid={grid}
                turn={turn}
                lastMove={lastMove}
                recommendations={recommendations}
                showHints={showHints}
                territoryMap={territoryMap}
                showTerritory={showTerritory}
                isThinking={isThinking}
                isExpanded={isBoardExpanded}
                onToggleExpand={() => setIsBoardExpanded(prev => !prev)}
                onPlaceStone={handlePlaceStone}
              />
            </div>

            {/* Right Column: Game Status Controls, Territory Evaluation Overlay, Chat & AI Coach Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: isBoardExpanded ? 'calc(100vh - 40px)' : 'calc(100vh - 90px)', overflowY: 'auto', paddingRight: '2px' }}>
              {isBoardExpanded && (
                <div className="glass-panel" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.85rem',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid #fbbf24',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                }}>
                  <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ⛶ 크게 보기 모드
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => handleNewGame()} className="glass-button primary" style={{ padding: '0.32rem 0.65rem', fontSize: '0.78rem' }}>
                      새 대국
                    </button>
                    <button onClick={() => setIsBoardExpanded(false)} className="glass-button" style={{ padding: '0.32rem 0.65rem', fontSize: '0.78rem', borderColor: '#fbbf24', color: '#fbbf24' }}>
                      ↙ 기본 화면
                    </button>
                  </div>
                </div>
              )}

              <TerritoryOverlay
                map={territoryMap}
                showTerritory={showTerritory}
                onToggleTerritory={() => setShowTerritory(!showTerritory)}
              />

              <GameStatus
                mode={mode}
                turn={turn}
                userColor={mode === 'online' ? onlineAssignedColor : userColor}
                capturesBlack={capturesBlack}
                capturesWhite={capturesWhite}
                komi={komi}
                isThinking={isThinking}
                gameOver={gameOver}
                resultMessage={resultMessage}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onPass={handlePass}
                onResign={handleResign}
                onOpenScoring={() => setIsScoringOpen(true)}
                canUndo={boardRef.current.historyIndex > 0}
                canRedo={boardRef.current.historyIndex < boardRef.current.history.length - 1}
              />

              {mode === 'online' && (
                <OnlineChatPanel opponentName={opponentProfile?.nickname || '온라인 상대'} />
              )}

              <AiCoachPanel
                mode={mode}
                recommendations={recommendations}
                showHints={showHints}
                onToggleHints={() => setShowHints(!showHints)}
                onRequestHints={handleRequestHints}
                isThinking={isThinking}
                history={boardRef.current.history}
                historyIndex={boardRef.current.historyIndex}
                onJumpToHistory={handleJumpToHistory}
              />
            </div>
          </>
        ) : (
          <TsumegoModal onClose={() => setMode('play')} />
        )}
      </main>

      {/* Modals */}
      {showRankSelector && (
        <RankSelector
          currentRank={aiRank}
          onSelectRank={(r) => setAiRank(r)}
          onClose={() => setShowRankSelector(false)}
        />
      )}

      {showAiEngineModal && (
        <AiEngineModal onClose={() => setShowAiEngineModal(false)} />
      )}

      {isScoringOpen && (
        <ScoringModal
          board={boardRef.current}
          komi={komi}
          onClose={() => setIsScoringOpen(false)}
          onRestartGame={() => {
            if (boardRef.current.gameOver) {
              const res = ScoringEngine.estimateTerritoryAndScore(boardRef.current, komi);
              const winnerColor = res.blackScore > res.whiteScore ? 'black' : 'white';
              const scoreDiff = Math.abs(res.blackScore - res.whiteScore);
              const amIBlack = (mode === 'online') ? onlineAssignedColor === 'black' : userColor === 'black';
              const myResult = winnerColor === (amIBlack ? 'black' : 'white') ? 'win' : 'loss';
              const safeMode = (mode === 'play' || mode === 'pvp' || mode === 'online') ? mode : 'play';
              const oppName = mode === 'online' ? opponentProfile?.nickname || '온라인 친구' : mode === 'play' ? aiRank.name : '1:1 상대';
              UserProfileService.recordGameResult(safeMode, myResult, oppName, amIBlack ? 'black' : 'white', scoreDiff);
              if (currentUser) {
                firebaseBridge.recordGameInCloud(currentUser.uid, safeMode, myResult, oppName, amIBlack ? 'black' : 'white', scoreDiff, aiRank.name);
              }
              setUserProfile(UserProfileService.getProfile());
            }
            setIsScoringOpen(false);
            handleNewGame();
          }}
        />
      )}

      {isProfileModalOpen && (
        <UserProfileModal
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdated={(updated) => setUserProfile(updated)}
          onLogout={handleLogout}
        />
      )}

      {isOnlineModalOpen && (
        <OnlinePvpModal
          onClose={() => setIsOnlineModalOpen(false)}
          onStartOnlineMatch={handleStartOnlineMatch}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(u, p) => {
            setCurrentUser(u);
            const isOwnerAdmin = (u?.email || '').toLowerCase().trim() === 'korbill73@gmail.com';
            setIsAdmin(isOwnerAdmin);
            if (p) {
              setUserProfile(p);
            }
          }}
        />
      )}

      {showAdminDashboard && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}

      {mode === 'tsumego' && <TsumegoModal onClose={() => setMode('play')} />}
    </div>
  );
}

export default App;
