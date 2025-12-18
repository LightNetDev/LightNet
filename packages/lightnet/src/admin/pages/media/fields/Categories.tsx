import { type Control } from "react-hook-form"

import DynamicArray from "../../../components/form/DynamicArray"
import Select from "../../../components/form/Select"
import type { MediaItem } from "../../../types/media-item"
import { useI18n } from "../../../../i18n/react/use-i18n"
import Button from "../../../components/form/atoms/Button"

export default function Categories({
  control,
  categories,
  defaultValue,
}: {
  control: Control<MediaItem>
  defaultValue: MediaItem["categories"]
  categories: { id: string; labelText: string }[]
}) {
  const { t } = useI18n()
  return (
    <DynamicArray
      control={control}
      name="categories"
      label="ln.categories"
      renderElement={(index) => (
        <Select
          options={categories}
          control={control}
          required
          name={`categories.${index}.value`}
          defaultValue={defaultValue[index]?.value}
          preserveHintSpace={false}
        />
      )}
      renderAddButton={({ addElement, index }) => (
        <Button
          variant="secondary"
          onClick={() =>
            addElement(
              { value: "" },
              { focusName: `categories.${index}.value` },
            )
          }
        >
          {t("ln.admin.add-category")}
        </Button>
      )}
    />
  )
}
