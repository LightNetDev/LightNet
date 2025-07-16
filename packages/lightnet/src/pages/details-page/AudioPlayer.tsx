import { useRef, useState, useEffect } from "react"

const audioPlaylist = [
  {
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    title: "Track 1 - Intro",
  },
  {
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    title: "Track 2 - Message",
  },
  {
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    title: "Track 3 - Closing Song",
  },
]

export default function AudioPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const audioRef = useRef(null)

  const handleNext = () => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex + 1 < audioPlaylist.length ? prevIndex + 1 : 0,
    )
  }

  const handlePrev = () => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex - 1 >= 0 ? prevIndex - 1 : audioPlaylist.length - 1,
    )
  }

  return (
    <div className="mx-auto max-w-md rounded bg-gray-100 p-4 shadow-md">
      <h2 className="mb-2 text-lg font-semibold">
        Now Playing: {audioPlaylist[currentTrackIndex].title}
      </h2>
      <audio
        ref={audioRef}
        controls
        autoPlay
        src={audioPlaylist[currentTrackIndex].src}
        onEnded={handleNext}
        className="w-full"
      />
      <div className="mt-2 flex justify-between">
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white"
          onClick={handlePrev}
        >
          Previous
        </button>
        <button
          className="rounded bg-green-500 px-4 py-2 text-white"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  )
}
