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
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form"

/**
 * Do not import this component directly. It is
 * very big. Use it with React lazy loading.
 */
export default function InternalMarkdownEditor<
  TFieldValues extends FieldValues,
>({
  control,
  defaultValue,
  name,
}: {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  defaultValue?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value } }) => (
        <MDXEditor
          markdown={value ?? ""}
          onBlur={onBlur}
          onChange={(markdown) => onChange(markdown)}
          contentEditableClassName="prose bg-gray-50 h-80 w-full max-w-full overflow-y-auto"
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
  )
}
