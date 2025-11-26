import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { type Control, useController } from "react-hook-form"

import ErrorMessage from "../../../components/form/atoms/ErrorMessage"
import Hint from "../../../components/form/atoms/Hint"
import Label from "../../../components/form/atoms/Label"
import { useFieldDirty } from "../../../components/form/hooks/use-field-dirty"
import { useFieldError } from "../../../components/form/hooks/use-field-error"
import { useI18n } from "../../../../i18n/react/use-i18n"
import type { MediaItem } from "../../../types/media-item"

export default function Image({
  control,
  defaultValue,
  mediaId,
}: {
  control: Control<MediaItem>
  defaultValue: MediaItem["image"]
  mediaId: string
}) {
  const { field } = useController({
    name: "image",
    control,
    defaultValue,
  })
  const { t } = useI18n()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(
    field.value?.previewSrc,
  )

  const isDirty = useFieldDirty({ control, name: "image.path" })
  const errorMessage = useFieldError({ control, name: "image.path" })
  const currentPath = field.value?.path ?? ""

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const relativePathLabel = useMemo(() => {
    return currentPath || t("ln.admin.image")
  }, [currentPath, t])

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
    // allow selecting the same file twice in a row
    event.target.value = ""
  }

  const setFile = (file: File) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }
    const objectUrl = URL.createObjectURL(file)
    objectUrlRef.current = objectUrl
    setPreviewSrc(objectUrl)
    field.onChange({
      ...field.value,
      path: buildRelativeImagePath(file, currentPath, mediaId),
      previewSrc: objectUrl,
      file,
    })
    field.onBlur()
  }

  return (
    <div className="group flex w-full flex-col">
      <label htmlFor="media-image-input">
        <Label
          label="ln.admin.image"
          isDirty={isDirty}
          isInvalid={!!errorMessage}
        />
      </label>
      <div
        className={`flex w-full items-center gap-4 rounded-lg rounded-ss-none border bg-gray-50 px-4 py-3 shadow-inner outline-none transition-colors ${isDragging ? "bg-sky-50" : ""} ${isDirty && !errorMessage ? "border-gray-700" : "border-gray-300"} ${errorMessage ? "border-rose-800" : ""} focus-within:border-sky-700 focus-within:ring-1 focus-within:ring-sky-700`}
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onBlur={field.onBlur}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-200">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-center text-xs text-gray-500">
              {t("ln.admin.image-empty")}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 py-1">
          <span className="text-sm font-semibold text-gray-800">
            {relativePathLabel}
          </span>
          <span className="text-sm text-gray-600">
            {t("ln.admin.image-upload-hint")}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-100 shadow-sm transition-colors duration-150 hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-1"
              onClick={(event) => {
                event.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              {t("ln.admin.select-file")}
            </button>
          </div>
        </div>
      </div>
      <input
        id="media-image-input"
        name={field.name}
        ref={(ref) => {
          fileInputRef.current = ref
          field.ref(ref)
        }}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={onFileChange}
      />
      <ErrorMessage message={errorMessage} />
      <Hint preserveSpace={true} label="ln.admin.image-hint" />
    </div>
  )
}

const buildRelativeImagePath = (
  file: File,
  currentPath: string,
  mediaId: string,
) => {
  const extension =
    file.name.includes(".") && file.name.split(".").at(-1)
      ? file.name.split(".").at(-1)!.toLowerCase()
      : ""
  const basePath = currentPath
    ? withoutExtension(currentPath)
    : `./images/${mediaId}`
  const normalizedBase = ensureLeadingDot(basePath)
  return extension ? `${normalizedBase}.${extension}` : normalizedBase
}

const withoutExtension = (path: string) => path.replace(/\.[^.]+$/, "")
const ensureLeadingDot = (path: string) => {
  const normalized = path.replace(/^\//, "")
  return normalized.startsWith("./") ? normalized : `./${normalized}`
}
