import { type ChangeEvent, type DragEvent, useRef, useState } from "react"
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form"
import config from "virtual:lightnet/config"

import { useI18n } from "../../../../i18n/react/use-i18n"

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
  const { t } = useI18n()

  const [isDragging, setIsDragging] = useState(false)

  const onFileSelected = (file?: File) => {
    if (!file) {
      return
    }
    if (!acceptedFileTypes.includes(file.type as any)) {
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
        className={`flex w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 bg-gray-200 p-4 transition-colors ease-in-out ${isDragging ? "border-sky-700 bg-sky-50" : ""} focus-within:border-sky-700 focus-within:outline-none hover:bg-sky-50`}
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
