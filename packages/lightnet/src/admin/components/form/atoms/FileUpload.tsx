import { type ChangeEvent, type DragEvent, useRef, useState } from "react"
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form"

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
  acceptedFileTypes: FileType[]
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
    if (!acceptedFileTypes.find((t) => t === file?.type)) {
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
        className={`flex w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-200 p-4 ${isDragging ? "border-sky-700 bg-sky-50" : ""} focus-within:border-sky-700`}
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
        <span className="text-sm text-gray-500">
          {t("ln.admin.image-upload-hint")}
        </span>
      </div>
      <input
        id={field.name}
        name={field.name}
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
