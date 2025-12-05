import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from "react"
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form"
import config from "virtual:lightnet/config"

import Icon from "../../../../components/Icon"
import { useI18n } from "../../../../i18n/react/use-i18n"
import "./file-upload.css"

type FileType = "image/png" | "image/jpeg" | "image/webp"

export default function FileUpload<TFieldValues extends FieldValues>({
  name,
  control,
  destinationPath,
  onFileChange,
  fileName,
  acceptedFileTypes,
}: {
  onFileChange: (file: File) => void
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  destinationPath: string
  fileName?: string
  acceptedFileTypes: Readonly<FileType[]>
}) {
  const { field } = useController({
    name,
    control,
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const invalidFeedbackTimeout = useRef<number | null>(null)
  const { t } = useI18n()

  const [isDragging, setIsDragging] = useState(false)
  const [showInvalidFeedback, setShowInvalidFeedback] = useState(false)

  useEffect(() => {
    return () => {
      if (invalidFeedbackTimeout.current !== null) {
        window.clearTimeout(invalidFeedbackTimeout.current)
      }
    }
  }, [])

  const triggerInvalidFeedback = () => {
    setShowInvalidFeedback(true)
    if (invalidFeedbackTimeout.current !== null) {
      window.clearTimeout(invalidFeedbackTimeout.current)
    }
    invalidFeedbackTimeout.current = window.setTimeout(() => {
      setShowInvalidFeedback(false)
      invalidFeedbackTimeout.current = null
    }, 2000)
  }

  const maxFileSizeBytes =
    (config.experimental?.admin?.maxFileSize ?? 0) * 1024 * 1024

  const onFileSelected = (file?: File) => {
    if (!file) {
      return
    }
    if (!acceptedFileTypes.includes(file.type as any)) {
      triggerInvalidFeedback()
      return
    }
    if (maxFileSizeBytes && !(file.size < maxFileSizeBytes)) {
      triggerInvalidFeedback()
      return
    }
    const nameParts = file.name.split(".")
    const extension = nameParts.pop()
    const name = nameParts.join(".")
    field.onChange({
      ...field.value,
      path: `${destinationPath}/${fileName ?? name}.${extension}`,
      file,
    })
    onFileChange(file)
    field.onBlur()
    setShowInvalidFeedback(false)
  }

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    onFileSelected(event.dataTransfer.files?.[0])
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileSelected(event.target.files?.[0])
    // allow selecting the same file twice in a row
    event.target.value = ""
  }

  return (
    <>
      <div
        className={`relative flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-md border-2 border-dashed bg-gray-200 p-4 transition-colors ease-in-out ${showInvalidFeedback ? "border-rose-800 file-upload--shake" : "border-gray-300"} ${isDragging ? "border-sky-700 bg-sky-50" : ""} focus-within:border-sky-700 focus-within:outline-none hover:bg-sky-50`}
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
        onDragOver={onDragEnter}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <span className="text-sm text-gray-800">
          {t("ln.admin.file-upload-hint")}
        </span>
        <span className="text-xs text-gray-600">
          {t("ln.admin.file-upload-size-limit", {
            limit: config.experimental?.admin?.maxFileSize,
          })}
        </span>
        {showInvalidFeedback && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-gray-50/85 text-rose-800"
            role="alert"
          >
            <Icon className="mdi--alert-circle-outline" ariaLabel="" />
            <span className="font-semibold">{t("ln.admin.file-not-accepted")}</span>
          </div>
        )}
      </div>
      <input
        id={field.name}
        name={field.name}
        tabIndex={-1}
        ref={(ref) => {
          fileInputRef.current = ref
          field.ref(ref)
        }}
        type="file"
        accept={acceptedFileTypes.join(",")}
        className="sr-only"
        onChange={onInputChange}
      />
    </>
  )
}
