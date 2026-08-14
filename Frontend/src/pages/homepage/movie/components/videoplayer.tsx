export default function VideoPlayer({ videoUrl, title }: { videoUrl: string; title: string }) {
  return (
    <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
      <video
        className="w-full aspect-video"
        controls
        autoPlay
        title={title}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}