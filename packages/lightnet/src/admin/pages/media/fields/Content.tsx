import { type Control, useWatch } from "react-hook-form"

import Icon from "../../../../components/Icon"
import { useI18n } from "../../../../i18n/react/use-i18n"
import { createContentMetadata } from "../../../../pages/details-page/utils/create-content-metadata"
import Button from "../../../components/form/atoms/Button"
import FileUpload from "../../../components/form/atoms/FileUpload"
import DynamicArray from "../../../components/form/DynamicArray"
import Input from "../../../components/form/Input"
import type { MediaItem } from "../../../types/media-item"

export default function Content({
  control,
  defaultValue,
}: {
  control: Control<MediaItem>
  defaultValue: MediaItem["content"]
}) {
  const { t } = useI18n()
  return (
    <DynamicArray
      control={control}
      name="content"
      required
      label="ln.admin.content"
      renderElement={(index) => (
        <div className="flex w-full flex-col gap-6">
          <URLInput
            control={control}
            defaultValue={defaultValue[index]?.url}
            index={index}
          />
          <LabelInput
            control={control}
            defaultValue={defaultValue[index]?.label}
            index={index}
          />
        </div>
      )}
      renderElementMeta={(index) => {
        if (index !== 0) {
          return <span></span>
        }
        return (
          <span className="ms-1 flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 text-xs font-bold uppercase text-slate-600">
            <Icon className="text-sm text-sky-700 mdi--star" ariaLabel="" />
            {t("ln.admin.primary-content")}
          </span>
        )
      }}
      renderAddButton={({ addElement, index }) => (
        <div className="flex w-2/3 flex-col items-center gap-2 pb-2 pt-4">
          <Button
            variant="secondary"
            onClick={() =>
              addElement({ url: "" }, { focusName: `content.${index}.url` })
            }
          >
            <Icon className="mdi--link-variant" ariaLabel="" />
            {t("ln.admin.add-link")}
          </Button>
          <span className="text-sm font-bold uppercase text-slate-500">
            {t("ln.admin.or")}
          </span>
          <FileUpload
            title="ln.admin.files-upload-title"
            description="ln.admin.files-upload-description"
            icon="mdi--file-upload-outline"
            multiple
            onUpload={(...files: File[]) =>
              files.forEach((file, i) => {
                addElement(
                  { url: `/files/${file.name}`, file },
                  { focusName: `content.${index + i}.url` },
                )
              })
            }
          />
        </div>
      )}
    />
  )
}

function URLInput({
  control,
  defaultValue,
  index,
}: {
  defaultValue?: string
  index: number
  control: Control<MediaItem>
}) {
  const { url, file } = useWatch({ control, name: `content.${index}` })
  const { t } = useI18n()
  const isFile = url.startsWith("/files/")

  const label = () => {
    if (!isFile) {
      return "ln.admin.link"
    }
    if (!file) {
      return "ln.admin.file"
    }
    return t("ln.admin.file-upload", {
      fileSize: (file.size / 1024 / 1024).toFixed(1),
    })
  }

  return (
    <Input
      control={control}
      label={label()}
      disabled={isFile}
      labelSize="small"
      required
      preserveHintSpace={false}
      defaultValue={defaultValue}
      name={`content.${index}.url`}
    />
  )
}

function LabelInput({
  control,
  defaultValue,
  index,
}: {
  control: Control<MediaItem>
  defaultValue?: string
  index: number
}) {
  const url = useWatch({ control, name: `content.${index}.url` })
  const { label: defaultLabel } = createContentMetadata({ url })

  return (
    <Input
      name={`content.${index}.label`}
      control={control}
      label="ln.admin.label"
      labelSize="small"
      placeholder={defaultLabel}
      preserveHintSpace={false}
      defaultValue={defaultValue}
      registerOptions={{
        setValueAs: (value) => value?.trim() || undefined,
      }}
    />
  )
}
