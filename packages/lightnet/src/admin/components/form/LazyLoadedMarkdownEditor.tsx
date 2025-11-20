import "@mdxeditor/editor/style.css"

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  type CodeBlockEditorProps,
  codeBlockPlugin,
  CreateLink,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  toolbarPlugin,
  UndoRedo,
  useCodeBlockEditorContext,
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
          onError={(error) =>
            console.error("Error while editing markdown", error)
          }
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            linkPlugin(),
            codeBlockPlugin({
              codeBlockEditorDescriptors: [
                {
                  match: () => true,
                  priority: 0,
                  Editor: TextAreaCodeEditor,
                },
              ],
            }),
            linkDialogPlugin(),
            quotePlugin(),
            markdownShortcutPlugin(),
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

function TextAreaCodeEditor(props: CodeBlockEditorProps) {
  const cb = useCodeBlockEditorContext()
  return (
    <div onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}>
      <textarea
        rows={3}
        cols={20}
        defaultValue={props.code}
        onChange={(e) => cb.setCode(e.target.value)}
      />
    </div>
  )
}
