import "server-only";

export function BackgroundScene() {
  return (
    <div className="bg-scene" aria-hidden>
      <div
        className="blob left-[-8%] top-[-12%] h-[46vw] w-[46vw] bg-[radial-gradient(circle_at_center,_rgba(244,114,182,0.30),_transparent_65%)] animate-[blob_26s_ease-in-out_infinite]"
      />
      <div
        className="blob right-[-10%] top-[8%] h-[40vw] w-[40vw] bg-[radial-gradient(circle_at_center,_rgba(201,165,106,0.2),_transparent_65%)] animate-[blob_30s_ease-in-out_infinite]"
      />
      <div
        className="blob bottom-[-14%] left-[22%] h-[42vw] w-[42vw] bg-[radial-gradient(circle_at_center,_rgba(148,162,148,0.18),_transparent_65%)] animate-[blob_34s_ease-in-out_infinite]"
      />
      <div
        className="blob bottom-[6%] right-[8%] h-[28vw] w-[28vw] bg-[radial-gradient(circle_at_center,_rgba(201,165,106,0.14),_transparent_65%)] animate-[blob_28s_ease-in-out_infinite]"
      />
    </div>
  );
}