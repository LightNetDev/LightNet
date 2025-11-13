import "@mdxeditor/editor/style.css"

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  MDXEditor,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor"
import { type Control, Controller } from "react-hook-form"

import Hint from "../../../components/form/atoms/Hint"
import type { MediaItem } from "../../../types/media-item"

export default function Description({
  control,
}: {
  control: Control<MediaItem>
}) {
  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm">
        <Controller
          control={control}
          name="description"
          render={({ field: { onBlur, onChange, value } }) => (
            <MDXEditor
              markdown={value ?? ""}
              onBlur={onBlur}
              onChange={(markdown) => onChange(markdown)}
              contentEditableClassName="prose bg-gray-50 h-72 w-full max-w-full overflow-y-auto"
              plugins={[
                headingsPlugin(),
                listsPlugin(),
                linkPlugin(),
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                      <BlockTypeSelect />
                    </>
                  ),
                }),
              ]}
            />
          )}
        />
      </div>
      <Hint />
    </>
  )
}
