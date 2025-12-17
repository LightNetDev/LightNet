import { useEffect, useRef, useState } from "react"
import { type Control } from "react-hook-form"

import ErrorMessage from "../../../components/form/atoms/ErrorMessage"
import FileUpload from "../../../components/form/atoms/FileUpload"
import Hint from "../../../components/form/atoms/Hint"
import Label from "../../../components/form/atoms/Label"
import { useFieldDirty } from "../../../components/form/hooks/use-field-dirty"
import { useFieldError } from "../../../components/form/hooks/use-field-error"
import type { MediaItem } from "../../../types/media-item"

const acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"] as const

export default function Image({
  control,
  defaultValue,
  mediaId,
}: {
  control: Control<MediaItem>
  defaultValue: MediaItem["image"]
  mediaId: string
}) {
  const objectUrlRef = useRef<string | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(
    defaultValue.previewSrc,
  )
  const isDirty = useFieldDirty({ control, name: "image" })
  const errorMessage = useFieldError({ control, name: "image", exact: false })

  useEffect(() => {
    // cleanup on component unmount
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const updateImage = (file?: File) => {
    if (!file) {
      return
    }
    if (!acceptedFileTypes.includes(file.type as any)) {
      return
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }
    const objectUrl = URL.createObjectURL(file)
    objectUrlRef.current = objectUrl
    setPreviewSrc(objectUrl)
  }

  return (
    <div className="group flex w-full flex-col">
      <label htmlFor="image">
        <Label
          label="ln.admin.image"
          isDirty={isDirty}
          required
          isInvalid={!!errorMessage}
        />
      </label>
      <div
        className={`flex w-full items-stretch gap-4 rounded-lg rounded-ss-none border bg-slate-50 px-4 py-3 shadow-inner outline-none transition-colors focus-within:border-sky-700 focus-within:ring-1 focus-within:ring-sky-700 ${isDirty && !errorMessage ? "border-slate-700" : "border-slate-300"} ${errorMessage ? "border-rose-800" : ""} `}
      >
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-200 p-1">
          <img
            src={previewSrc}
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
        <FileUpload
          name="image"
          control={control}
          onFileChange={updateImage}
          destinationPath="./images"
          acceptedFileTypes={acceptedFileTypes}
          fileName={mediaId}
        />
      </div>
      <ErrorMessage message={errorMessage} />
      <Hint preserveSpace={true} label="ln.admin.image-hint" />
    </div>
  )
}
