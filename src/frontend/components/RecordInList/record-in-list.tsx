import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import {
    Placeholder,
    TableRow,
    TableCell,
    CheckBox,
    ButtonGroup,
    Button,
    Icon,
    Box,
} from "@adminjs/design-system";
import {
    ActionJSON,
    ActionResponse,
    BasePropertyComponent,
    RecordActionResponse,
    RecordJSON,
    ResourceJSON,
    useActionResponseHandler,
    useCurrentAdmin,
    useModal,
    useTranslation,
} from "adminjs";
import mergeRecordResponse from "./merge-record-response.js";
import { buildActionClickHandler } from "./build-action-click-handler.js";
import { actionsToButtonGroup } from "./actions-to-button-group.js";
import { getResourceElementCss } from "./data-css-name.js";
import { display } from "./display.js";
import EditLetterModal from "../Letters/EditLetterModal.js";
import EditLetterTypeModal from "../LetterTypes/EditLetterTypeModal.js";
import UserModal from "../Users/UserModal.js";

export type RecordInListProps = {
    resource: ResourceJSON;
    record: RecordJSON;
    actionPerformed?: (action: ActionResponse) => any;
    isLoading?: boolean;
    onSelect?: (record: RecordJSON) => void;
    isSelected?: boolean;
};

const RecordInList: React.FC<RecordInListProps> = (props) => {
    const {
        resource,
        record: recordFromProps,
        actionPerformed,
        isLoading,
        onSelect,
        isSelected,
    } = props;
    const [record, setRecord] = useState<RecordJSON>(recordFromProps);
    const navigate = useNavigate();
    const location = useLocation();
    const translateFunctions = useTranslation();
    const modalFunctions = useModal();
    const [currentAdmin] = useCurrentAdmin();
    const isUsers = resource.id === "users";
    const isCurrentUser = isUsers && String(record.id) === String(currentAdmin?.id);

    const [modalOpen, setModalOpen] = useState<RecordJSON | null>(null);
    const [editInModal, setEditInModal] = useState(false);

    const handleActionCallback = useCallback(
        (actionResponse: ActionResponse) => {
            if (actionResponse.record && !actionResponse.redirectUrl) {
                setRecord(
                    mergeRecordResponse(
                        record,
                        actionResponse as RecordActionResponse
                    )
                );
            } else if (actionPerformed) {
                actionPerformed(actionResponse);
            }
        },
        [actionPerformed, record]
    );

    const actionResponseHandler =
        useActionResponseHandler(handleActionCallback);

    useEffect(() => {
        setRecord(recordFromProps);
    }, [recordFromProps]);

    const { recordActions } = record;

    const show = record.recordActions.find(({ name }) => name === "show");
    const edit = record.recordActions.find(({ name }) => name === "edit");
    const ViewBook = record.recordActions.find(
        ({ name }) => name === "ViewBook"
    );
    const action =
        resource.id === "books"
            ? ViewBook
            : resource.id === "letter_types"
            ? ""
            : show
            ? show
            : edit;

    const handleClick = (event): void => {
        const targetTagName = (
            event.target as HTMLElement
        ).tagName.toLowerCase();

        // Open a modal popup for letters, letter_types and users instead of navigating
        if (
            (resource.id === "letters" || resource.id === "letter_types" || isUsers) &&
            targetTagName !== "a" &&
            targetTagName !== "button" &&
            targetTagName !== "svg"
        ) {
            event.preventDefault();
            event.stopPropagation();
            setEditInModal(false);
            setModalOpen(record);
            return;
        }

        if (
            action &&
            targetTagName !== "a" &&
            targetTagName !== "button" &&
            targetTagName !== "svg"
        ) {
            buildActionClickHandler({
                action,
                params: { resourceId: resource.id, recordId: record.id },
                actionResponseHandler,
                navigate,
                location,
                translateFunctions,
                modalFunctions,
            })(event);
        }
    };

    const actionParams = { resourceId: resource.id, recordId: record.id };

    const handleActionClick = (
        event,
        sourceAction: ActionJSON
    ): void | Promise<void> =>
        buildActionClickHandler({
            action: sourceAction,
            params: actionParams,
            actionResponseHandler,
            navigate,
            location,
            translateFunctions,
            modalFunctions,
        })(event);

    const buttons = [
        {
            icon: "MoreHorizontal",
            variant: "light" as const,
            label: undefined,
            "data-testid": "actions-dropdown",
            buttons: actionsToButtonGroup({
                actions: recordActions,
                params: actionParams,
                handleClick: handleActionClick,
                translateFunctions,
                modalFunctions,
            }),
        },
    ];
    const contentTag = getResourceElementCss(resource.id, "table-row");
    return (
        <>
            <TableRow
                className={`${isSelected ? "selected" : "not-selected"}${isCurrentUser ? " current-user" : ""}`}
                onClick={handleClick}
                data-id={record.id}
                data-css={contentTag}
            >
            <TableCell width={0}>
                {onSelect && record.bulkActions.length ? (
                    <CheckBox
                        onChange={() => onSelect(record)}
                        checked={isSelected}
                    />
                ) : null}
            </TableCell>
            {resource.listProperties.map((property) => {
                const cellTag = `${resource.id}-${property.name}-table-cell`;
                return (
                    <TableCell
                        style={{ cursor: "pointer" }}
                        key={property.propertyPath}
                        data-property-name={property.propertyPath}
                        display={display(property.isTitle)}
                        data-css={cellTag}
                    >
                        {isLoading ? (
                            <Placeholder style={{ height: 14 }} />
                        ) : (
                            <>
                                <BasePropertyComponent
                                    key={property.propertyPath}
                                    where="list"
                                    property={property}
                                    resource={resource}
                                    record={record}
                                />
                                {isCurrentUser && property.isTitle && (
                                    <span className="current-user-dot" title="You (logged in)" />
                                )}
                            </>
                        )}
                    </TableCell>
                );
            })}
            <TableCell key="options" className="options">
                {isUsers ? (
                    <Box flex style={{ gap: 4 }}>
                        {recordActions.map((a) => (
                            <Button
                                key={a.name}
                                type="button"
                                size="icon"
                                variant="text"
                                color={a.variant === "danger" ? "danger" : undefined}
                                title={translateFunctions.translateAction(a.label, resource.id)}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    if (a.name === "show" || a.name === "edit") {
                                        setEditInModal(a.name === "edit");
                                        setModalOpen(record);
                                    } else handleActionClick(event, a);
                                }}
                            >
                                <Icon icon={a.icon} />
                            </Button>
                        ))}
                    </Box>
                ) : recordActions.length ? (
                    <ButtonGroup buttons={buttons} />
                ) : null}
            </TableCell>
            </TableRow>
            {modalOpen &&
                (resource.id === "letters" ? (
                    <EditLetterModal
                        record={modalOpen}
                        onClose={() => setModalOpen(null)}
                        onSave={() => setModalOpen(null)}
                    />
                ) : resource.id === "letter_types" ? (
                    <EditLetterTypeModal
                        record={modalOpen}
                        onClose={() => setModalOpen(null)}
                        onSave={() => setModalOpen(null)}
                    />
                ) : isUsers ? (
                    <UserModal
                        record={modalOpen}
                        startEditing={editInModal}
                        onClose={() => setModalOpen(null)}
                        onSave={() => {
                            setModalOpen(null);
                            actionPerformed?.({} as ActionResponse);
                        }}
                    />
                ) : null)}
        </>
    );
};

export default RecordInList;
