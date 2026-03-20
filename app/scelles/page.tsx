// app/scelles/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ShieldAlert, Loader2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const GRID_SIZE = 20;
const INITIAL_SPEED = 180; // Vitesse de base (en ms)

// Les objets qu'on peut voler dans les scellés
const ITEMS = [
  { type: "GUN", icon: "🔫", points: 50 },
  { type: "BATON", icon: "🏏", points: 30 },
  { type: "HANDCUFFS", icon: "🔗", points: 15 },
  { type: "DONUT", icon: "🍩", points: 5 },
];

type Point = { x: number; y: number };

export default function ScellesPage() {
  const router = useRouter();
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ pos: { x: 5, y: 5 }, item: ITEMS[3] });
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [claiming, setClaiming] = useState(false);
  
  // Utilisation de useRef pour éviter les bugs de délai avec les touches rapides
  const directionRef = useRef(direction);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newPos;
    while (true) {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some((segment) => segment.x === newPos.x && segment.y === newPos.y)) {
        break;
      }
    }
    // Tirage au sort de l'objet (plus de chance d'avoir un donut qu'un flingue)
    const rand = Math.random();
    let itemIndex = 3; // Donut par défaut
    if (rand < 0.1) itemIndex = 0; // 10% Gun
    else if (rand < 0.3) itemIndex = 1; // 20% Baton
    else if (rand < 0.6) itemIndex = 2; // 30% Handcuffs

    setFood({ pos: newPos, item: ITEMS[itemIndex] });
  }, []);

  const claimMoney = async (finalScore: number) => {
    if (finalScore <= 0) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/scelles/claim", {
        method: "POST",
        body: JSON.stringify({ amount: finalScore }),
      });
      if (res.ok) {
        toast.success(`+ ${finalScore} ₪ blanchis avec succès !`);
        router.refresh();
      } else {
        toast.error("L'IGPN a saisi votre butin.");
      }
    } catch (e) {
      toast.error("Erreur réseau");
    } finally {
      setClaiming(false);
    }
  };

  const endGame = () => {
    setGameOver(true);
    setIsPlaying(false);
    claimMoney(score);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Collision avec les murs
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          endGame();
          return prevSnake;
        }

        // Collision avec lui-même
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          endGame();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // A mangé un objet
        if (newHead.x === food.pos.x && newHead.y === food.pos.y) {
          setScore((s) => s + food.item.points);
          generateFood(newSnake);
        } else {
          newSnake.pop(); // Retire la queue s'il n'a pas mangé
        }

        return newSnake;
      });
    };

    // Le jeu accélère un peu quand le score monte
    const currentSpeed = Math.max(70, INITIAL_SPEED - Math.floor(score / 50) * 5);
    const interval = setInterval(moveSnake, currentSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, food, score, generateFood]);

  // Contrôles Clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
      
      switch (e.key) {
        case "ArrowUp":
          if (directionRef.current.y === 0) directionRef.current = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          if (directionRef.current.y === 0) directionRef.current = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          if (directionRef.current.x === 0) directionRef.current = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          if (directionRef.current.x === 0) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMobileControl = (newDir: Point) => {
    // Empêcher de faire demi-tour directement
    if (newDir.x !== 0 && directionRef.current.x !== 0) return;
    if (newDir.y !== 0 && directionRef.current.y !== 0) return;
    directionRef.current = newDir;
  };

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    directionRef.current = { x: 0, y: -1 };
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    generateFood([{ x: 10, y: 10 }]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-32 flex flex-col items-center">
      <header className="mb-6 w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-2 text-indigo-500">
          <ShieldAlert size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Zone Restreinte</span>
        </div>
        <h1 className="text-3xl font-black italic tracking-tighter text-white">SALLE DES SCELLÉS</h1>
        <p className="text-slate-500 text-xs mt-1">Volez les pièces à conviction. Ne vous faites pas prendre.</p>
      </header>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center relative overflow-hidden">
        
        {/* Affichage du Score */}
        <div className="flex justify-between w-full mb-4 items-end">
            <div>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Valeur du butin</p>
                <p className="text-3xl font-mono font-black text-emerald-400">{score} ₪</p>
            </div>
        </div>

        {/* Le Plateau de Jeu */}
        <div 
            className="bg-slate-950 border-2 border-slate-800 rounded-xl relative overflow-hidden"
            style={{ width: '100%', aspectRatio: '1/1', maxWidth: '350px' }}
        >
          {/* Menu Start / Game Over Overlay */}
          {(!isPlaying || gameOver) && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
              {gameOver ? (
                <>
                  <h2 className="text-2xl font-black italic text-red-500 mb-2">GAV !</h2>
                  <p className="text-sm text-slate-300 mb-4">Vous avez été surpris par le chef.</p>
                  <p className="text-xl font-mono font-black text-emerald-400 mb-6 border border-emerald-500/30 bg-emerald-500/10 py-2 px-4 rounded-xl">
                    +{score} ₪ récupérés
                  </p>
                </>
              ) : (
                 <p className="text-sm text-slate-400 mb-6 italic">Déplacez-vous pour voler le matériel.</p>
              )}
              
              <button 
                onClick={startGame}
                disabled={claiming}
                className="bg-indigo-600 hover:bg-indigo-500 w-full py-4 rounded-2xl font-black uppercase flex justify-center items-center gap-2"
              >
                {claiming ? <Loader2 className="animate-spin" /> : (gameOver ? "Recommencer le casse" : "Forcer la serrure")}
              </button>
            </div>
          )}

          {/* Rendu du Serpent et de la Nourriture */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <div
                key={index}
                className={`absolute flex items-center justify-center rounded-sm ${isHead ? 'z-10 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-blue-800/80 border border-blue-900'}`}
                style={{
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                  left: `${(segment.x / GRID_SIZE) * 100}%`,
                  top: `${(segment.y / GRID_SIZE) * 100}%`,
                }}
              >
                {isHead && <span className="text-[12px]">👮</span>}
              </div>
            );
          })}

          <div
            className="absolute flex items-center justify-center z-0"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(food.pos.x / GRID_SIZE) * 100}%`,
              top: `${(food.pos.y / GRID_SIZE) * 100}%`,
            }}
          >
            <span className="text-[16px] drop-shadow-lg">{food.item.icon}</span>
          </div>
        </div>

        {/* Contrôles tactiles pour Mobile */}
        <div className="grid grid-cols-3 gap-2 mt-6 w-full max-w-[200px]">
            <div />
            <button onClick={() => handleMobileControl({ x: 0, y: -1 })} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex justify-center"><ArrowUp size={24} /></button>
            <div />
            <button onClick={() => handleMobileControl({ x: -1, y: 0 })} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex justify-center"><ArrowLeft size={24} /></button>
            <button onClick={() => handleMobileControl({ x: 0, y: 1 })} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex justify-center"><ArrowDown size={24} /></button>
            <button onClick={() => handleMobileControl({ x: 1, y: 0 })} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex justify-center"><ArrowRight size={24} /></button>
        </div>

      </div>
    </div>
  );
}