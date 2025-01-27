import {
    AccordionChevron,
    Checkbox,
    Group,
    Tree as MantineTree,
    RenderTreeNodePayload,
    TreeNodeData,
    getTreeExpandedState,
    useTree,
} from "@mantine/core";
import { useDidUpdate } from "@mantine/hooks";
import { BoxProps } from "props/box";
import { DashBaseProps } from "props/dash";
import { StylesApiProps } from "props/styles";
import React from "react";

interface Props extends BoxProps, StylesApiProps, DashBaseProps {
    /** Determines whether tree nodes range can be selected with click when Shift key is pressed, `true` by default */
    allowRangeSelection?: boolean;
    /** Determines if checkboxes should be rendered, `false` by default */
    checkboxes?: boolean;
    /** Determines checked nodes as a list of values (note that only leaves can be checked), `[]` by default */
    checked?: string[];
    /** Determines whether tree node should be checked on space key press, `false` by default */
    checkOnSpace?: boolean;
    /** Determines whether selection should be cleared when user clicks outside of the tree, `false` by default */
    clearSelectionOnOutsideClick?: boolean;
    /** Data used to render nodes */
    data: TreeNodeData[];
    /** Determines expanded nodes as a list of values or `'*'` for all, `[]` by default */
    expanded?: string[] | "*";
    /** Determines whether tree node with children should be expanded on click, `true` by default */
    expandOnClick?: boolean;
    /** Determines whether tree node with children should be expanded on space key press, `true` by default */
    expandOnSpace?: boolean;
    /** Horizontal padding of each subtree level, key of `theme.spacing` or any valid CSS value, `'lg'` by default */
    levelOffset?: string | number;
    /** Determines selected nodes as a list of values, `[]` by default */
    selected?: string[];
    /** Determines whether node should be selected on click, `false` by default */
    selectOnClick?: boolean;
    /** Expanded state icon */
    expandedIcon?: React.ReactNode;
    /** Collapsed state icon */
    collapsedIcon?: React.ReactNode;
    /** Side to display expanded/collapsed state icon on, `'left'` by default */
    iconSide?: "left" | "right" | "none";
}

interface LeafProps {
    checkboxes: boolean;
    expandedIcon: React.ReactNode;
    collapsedIcon: React.ReactNode;
    iconSide?: "left" | "right" | "none";
}

const Leaf = (props: RenderTreeNodePayload & LeafProps) => {
    const {
        node,
        expanded,
        hasChildren,
        elementProps,
        tree,
        checkboxes,
        expandedIcon,
        collapsedIcon,
        iconSide,
    } = props;
    const checked = tree.isNodeChecked(node.value);
    const indeterminate = tree.isNodeIndeterminate(node.value);
    const icon = (
        <span
            style={{
                visibility: hasChildren ? "visible" : "hidden",
                transform:
                    collapsedIcon !== undefined || expanded
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                transition: "0.2s",
            }}
        >
            {collapsedIcon === undefined || expanded
                ? expandedIcon
                : collapsedIcon}
        </span>
    );
    return (
        <Group gap="xs" {...elementProps}>
            {iconSide === "left" && icon}
            {checkboxes && (
                <Checkbox.Indicator
                    checked={checked}
                    indeterminate={indeterminate}
                    onClick={(event) => {
                        event.stopPropagation();
                        !checked
                            ? tree.checkNode(node.value)
                            : tree.uncheckNode(node.value);
                    }}
                />
            )}
            <span>{node.label}</span>
            {iconSide === "right" && icon}
        </Group>
    );
};

const Tree = (props: Props) => {
    const {
        checkboxes,
        checked,
        data,
        expanded,
        loading_state,
        selected,
        setProps,
        expandedIcon,
        collapsedIcon,
        iconSide,
        ...others
    } = props;

    const tree = useTree({
        initialExpandedState: getTreeExpandedState(data, expanded),
        initialCheckedState: checked,
        initialSelectedState: selected,
    });

    useDidUpdate(() => {
        tree.setCheckedState(checked);
    }, [checked]);

    useDidUpdate(() => {
        setProps({ checked: tree.checkedState });
    }, [tree.checkedState]);

    useDidUpdate(() => {
        setProps({ selected: tree.selectedState });
    }, [tree.selectedState]);

    useDidUpdate(() => {
        tree.setSelectedState(selected);
    }, [selected]);

    useDidUpdate(() => {
        expanded === "*"
            ? tree.expandAllNodes()
            : tree.setExpandedState(
                  Object.fromEntries(expanded.map((x) => [x, true]))
              );
    }, [expanded]);

    useDidUpdate(() => {
        setProps({
            expanded: Object.entries(tree.expandedState)
                .filter(([k, v]) => v)
                .map(([k, v]) => k),
        });
    }, [tree.expandedState]);

    return (
        <MantineTree
            data-dash-is-loading={
                (loading_state && loading_state.is_loading) || undefined
            }
            data={data}
            tree={tree}
            renderNode={(payload) => (
                <Leaf
                    key={payload.node.value}
                    checkboxes={checkboxes}
                    expandedIcon={expandedIcon}
                    collapsedIcon={collapsedIcon}
                    iconSide={iconSide}
                    {...payload}
                />
            )}
            {...others}
        />
    );
};

Tree.defaultProps = {
    expanded: [],
    expandOnClick: true,
    expandedIcon: <AccordionChevron />,
    iconSide: "left",
};

export default Tree;
