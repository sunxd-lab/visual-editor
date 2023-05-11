import deepcopy from "deepcopy";
import { ElButton } from "element-plus";
import { computed, defineComponent, inject, ref } from "vue";
import { $dialog } from "../components/Dialog";
import { $dropdown, DropdownItem } from "../components/Dropdown";
import EditorBlock from "./editor-block";
import EditorOperator from "./editor-operator";
import "./editor.scss";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { useFocus } from "./useFocus";
import { useMenuDragger } from "./useMenuDragger";

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
    },
    formData: {
      type: Object,
    },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    // 预览的时候，内容无法再操作，可点击，输入内容
    const previewRef = ref(false);
    // 关闭编辑区
    const editorRef = ref(true);

    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newValue) {
        ctx.emit("update:modelValue", deepcopy(newValue));
      },
    });

    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));

    const config = inject("config");

    const containerRef = ref(null);
    // 拖拽功能
    const { dragstart, dragend } = useMenuDragger(containerRef, data);
    // 获取焦点
    const {
      blockMousedown,
      containerMousedown,
      focusData,
      lastSelectedBlock,
      clearBlockFocus,
    } = useFocus(data, previewRef, (e) => mousedown(e));
    const { mousedown, markLine } = useBlockDragger(
      focusData,
      lastSelectedBlock,
      data
    );

    const { commands } = useCommand(data, focusData);
    const buttons = [
      { label: "撤销", icon: "icon-back", handler: () => commands.undo() },
      { label: "重做", icon: "icon-forward", handler: () => commands.redo() },
      {
        label: "导出",
        icon: "icon-export",
        handler: () => {
          $dialog({
            title: "导出JSON",
            content: JSON.stringify(data.value),
          });
        },
      },
      {
        label: "导入",
        icon: "icon-import",
        handler: () => {
          $dialog({
            title: "导入JSON",
            content: "",
            footer: true,
            onConfirm: (text) => {
              // 这样更改无法保留历史记录
              // data.value = JSON.parse(text)
              commands.updateContainer(JSON.parse(text));
            },
          });
        },
      },
      {
        label: "置顶",
        icon: "icon-place-top",
        handler: () => commands.placeTop(),
      },
      {
        label: "置底",
        icon: "icon-place-bottom",
        handler: () => commands.placeBottom(),
      },
      { label: "删除", icon: "icon-delete", handler: () => commands.delete() },
      {
        label: () => (previewRef.value ? "编辑" : "预览"),
        icon: () => (previewRef.value ? "icon-edit" : "icon-browse"),
        handler: () => {
          previewRef.value = !previewRef.value;
          clearBlockFocus();
        },
      },
      {
        label: "关闭",
        icon: "icon-close",
        handler: () => {
          editorRef.value = false;
          clearBlockFocus();
        },
      },
    ];

    const onContextMenuBlock = (e, block) => {
      e.preventDefault();
      $dropdown({
        el: e.target, // 以哪个元素为准，产生一个dropdown
        content: () => (
          <>
            <DropdownItem
              label="删除"
              icon="icon-delete"
              onClick={() => commands.delete()}
            ></DropdownItem>
            <DropdownItem
              label="置顶"
              icon="icon-place-top"
              onClick={() => commands.placeTop()}
            ></DropdownItem>
            <DropdownItem
              label="置底"
              icon="icon-place-bottom"
              onClick={() => commands.placeBottom()}
            ></DropdownItem>
            <DropdownItem
              label="查看"
              icon="icon-browse"
              onClick={() => {
                $dialog({
                  title: "查看节点数据",
                  content: JSON.stringify(block),
                });
              }}
            ></DropdownItem>
            <DropdownItem
              label="导入"
              icon="icon-import"
              onClick={() => {
                $dialog({
                  title: "导入节点数据",
                  content: "",
                  footer: true,
                  onConfirm: (text) => {
                    // 这样更改无法保留历史记录
                    // data.value = JSON.parse(text)
                    commands.updateBlock(JSON.parse(text), block);
                  },
                });
              }}
            ></DropdownItem>
          </>
        ),
      });
    };

    return () =>
      editorRef.value ? (
        <div class="editor">
          <div class="editor-left">
            {config.componentList.map((component) => (
              <div
                class="editor-left-item"
                draggable
                onDragstart={(e) => {
                  dragstart(e, component);
                }}
                onDragend={dragend}
              >
                <span>{component.label}</span>
                {component.preview()}
              </div>
            ))}
          </div>
          <div class="editor-top">
            {buttons.map((button, index) => {
              const icon =
                typeof button.icon === "function" ? button.icon() : button.icon;
              const label =
                typeof button.label === "function"
                  ? button.label()
                  : button.label;
              return (
                <div class="editor-top-button" onClick={button.handler}>
                  <i class={`iconfont ${icon}`}></i>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
          {/* 属性控制栏目 */}
          <div class="editor-right">
            <EditorOperator
              block={lastSelectedBlock.value}
              data={data.value}
              updateContainer={commands.updateContainer}
              updateBlock={commands.updateBlock}
            ></EditorOperator>
          </div>
          <div class="editor-container">
            <div class="editor-container-canvas">
              <div
                ref={containerRef}
                class="editor-container-canvas__content"
                style={containerStyles.value}
                onMousedown={containerMousedown}
              >
                {data.value.blocks.map((block, index) => (
                  <EditorBlock
                    class={block.focus ? "editor-block-focus" : ""}
                    class={
                      previewRef.value
                        ? "editor-block-preview"
                        : "editor-block-editing"
                    }
                    block={block}
                    onMousedown={(e) => blockMousedown(e, block, index)}
                    onContextmenu={(e) => onContextMenuBlock(e, block)}
                    formData={props.formData}
                  ></EditorBlock>
                ))}
                {markLine.x !== null && (
                  <div class="line-x" style={{ left: markLine.x + "px" }}></div>
                )}
                {markLine.y !== null && (
                  <div class="line-y" style={{ top: markLine.y + "px" }}></div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            class="editor-container-canvas__content"
            style={containerStyles.value}
          >
            {data.value.blocks.map((block, index) => (
              <EditorBlock
                class={"editor-block-preview"}
                block={block}
                formData={props.formData}
              ></EditorBlock>
            ))}
          </div>
          <div>
            <ElButton type="primary" onClick={() => (editorRef.value = true)}>
              继续编辑
            </ElButton>
            {JSON.stringify(props.formData)}
          </div>
        </>
      );
  },
});
