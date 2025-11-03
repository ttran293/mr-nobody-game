"use client"

import Image from "next/image"
import type { CharacterProps } from "@/lib/character"
import { emotionToImage } from "@/lib/utils"

interface CharacterCardProps {
  character: CharacterProps
}

export function CharacterCard({ character }: CharacterCardProps) {
  const imageSrc = emotionToImage(character.emotion)
  return (
    <div className="flex flex-col items-center gap-2">
      {imageSrc && (
        <Image src={imageSrc} alt={character.emotion} width={160} height={160} priority />
      )}
      <div className="text-sm">
        <p>name: {character.name}</p>
        <p>gender: {character.gender}</p>
        <p>age: {character.age}</p>
        <p>emotion: {character.emotion}</p>
      </div>
    </div>
  )
}


