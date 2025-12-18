import { type Control } from "react-hook-form"

import Icon from "../../../../components/Icon"
import { useI18n } from "../../../../i18n/react/use-i18n"
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
          <Input
            control={control}
            label="URL (TODO translation)"
            labelSize="small"
            required
            preserveHintSpace={false}
            defaultValue={defaultValue[index]?.url}
            {...control.register(`content.${index}.url`)}
          />
          <Input
            control={control}
            label="ln.admin.label"
            labelSize="small"
            preserveHintSpace={false}
            defaultValue={defaultValue[index]?.label}
            {...control.register(`content.${index}.label`)}
          />
        </div>
      )}
      renderAddButton={({ addElement, index }) => (
        <div className="flex w-2/3 flex-col items-center gap-4 py-2">
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
