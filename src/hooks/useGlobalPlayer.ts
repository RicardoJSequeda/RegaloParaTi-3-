'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GlobalSong {
  id: string
  title: string
  artist: string
  album?: string
  duration: string
  cover: string
  dedication: string
  isFavorite: boolean
  genre?: string
  year?: string
  plays: number
  fileName: string
  audioUrl: string
}

interface GlobalPlayerState {
  // Estado del reproductor
  currentSong: GlobalSong | null
  isPlaying: boolean
  isActuallyPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  repeat: boolean
  shuffle: boolean
  playlist: GlobalSong[]
  
  // Acciones
  setCurrentSong: (song: GlobalSong | null) => void
  setIsPlaying: (playing: boolean) => void
  setIsActuallyPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setRepeat: (repeat: boolean) => void
  setShuffle: (shuffle: boolean) => void
  setPlaylist: (playlist: GlobalSong[]) => void
  
  // Acciones de control
  play: () => void
  pause: () => void
  togglePlay: () => void
  nextSong: () => void
  prevSong: () => void
  selectSong: (song: GlobalSong) => void
  
  // Utilidades
  hasValidAudio: (song: GlobalSong) => boolean
}

export const useGlobalPlayer = create<GlobalPlayerState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentSong: null,
      isPlaying: false,
      isActuallyPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      repeat: false,
      shuffle: false,
      playlist: [],
      
      // Setters
      setCurrentSong: (song) => set({ currentSong: song }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setIsActuallyPlaying: (playing) => set({ isActuallyPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration: duration }),
      setVolume: (volume) => set({ volume: volume }),
      setRepeat: (repeat) => set({ repeat: repeat }),
      setShuffle: (shuffle) => set({ shuffle: shuffle }),
      setPlaylist: (playlist) => set({ playlist: playlist }),
      
      // Acciones de control
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => {
        const { isPlaying, currentSong, hasValidAudio } = get()
        if (!currentSong || !hasValidAudio(currentSong)) return
        set({ isPlaying: !isPlaying })
      },
      
      nextSong: () => {
        const { playlist, currentSong, shuffle, setCurrentSong, setCurrentTime, play } = get()
        if (playlist.length === 0) return
        
        const currentIndex = playlist.findIndex(song => song.id === currentSong?.id)
        let nextIndex: number
        
        if (shuffle) {
          nextIndex = Math.floor(Math.random() * playlist.length)
        } else {
          nextIndex = (currentIndex + 1) % playlist.length
        }
        
        const nextSong = playlist[nextIndex]
        setCurrentSong(nextSong)
        setCurrentTime(0)
        play()
      },
      
      prevSong: () => {
        const { playlist, currentSong, setCurrentSong, setCurrentTime, play } = get()
        if (playlist.length === 0) return
        
        const currentIndex = playlist.findIndex(song => song.id === currentSong?.id)
        const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1
        const prevSong = playlist[prevIndex]
        
        setCurrentSong(prevSong)
        setCurrentTime(0)
        play()
      },
      
      selectSong: (song) => {
        const { setCurrentSong, setCurrentTime, play } = get()
        setCurrentSong(song)
        setCurrentTime(0)
        play()
      },
      
      // Utilidades
      hasValidAudio: (song) => {
        return !!(song.audioUrl || (song as any).audio_url)
      }
    }),
    {
      name: 'global-player-storage',
      partialize: (state) => ({
        currentSong: state.currentSong,
        isPlaying: state.isPlaying,
        volume: state.volume,
        repeat: state.repeat,
        shuffle: state.shuffle,
        playlist: state.playlist
      })
    }
  )
)
