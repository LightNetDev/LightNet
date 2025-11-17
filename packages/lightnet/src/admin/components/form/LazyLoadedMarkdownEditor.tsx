import "@mdxeditor/editor/style.css"

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  MDXEditor,
  quotePlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor"
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form"

/**
 * IMPORTANT: Do not import this component directly. It is
 * very big. Use it with React lazy loading.
 */
export default function LazyLoadedMarkdownEditor<
  TFieldValues extends FieldValues,
>({
  control,
  name,
}: {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value, ref } }) => (
        <MDXEditor
          markdown={value ?? ""}
          onBlur={onBlur}
          onChange={onChange}
          contentEditableClassName="prose bg-gray-50 h-80 w-full max-w-full overflow-y-auto"
          ref={ref}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            quotePlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <BlockTypeSelect />
                  <ListsToggle options={["bullet", "number"]} />
                  <CreateLink />
                </>
              ),
            }),
          ]}
        />
      )}
    />
  )
}
