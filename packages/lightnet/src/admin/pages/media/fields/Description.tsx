import "@mdxeditor/editor/style.css"

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  CreateLink,
  quotePlugin,
  diffSourcePlugin,
  linkDialogPlugin,
  DiffSourceToggleWrapper,
  MDXEditor,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor"
import { type Control, Controller } from "react-hook-form"

import Hint from "../../../components/form/atoms/Hint"
import type { MediaItem } from "../../../types/media-item"
import { useEffect, useState } from "react"

export default function Description({
  control,
  defaultValue,
}: {
  control: Control<MediaItem>
  defaultValue?: string
}) {
  // lazy load editor, as it does not support prerendering
  const [renderEditor, setRenderEditor] = useState(false)
  useEffect(() => setRenderEditor(true), [])
  if (!renderEditor) {
    return null
  }
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
                linkDialogPlugin(),
                diffSourcePlugin({
                  viewMode: "rich-text",
                  diffMarkdown: defaultValue,
                }),
                quotePlugin(),
                toolbarPlugin({
                  toolbarContents: () => (
                    <DiffSourceToggleWrapper>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                      <BlockTypeSelect />
                      <ListsToggle options={["bullet", "number"]} />
                      <CreateLink />
                    </DiffSourceToggleWrapper>
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
