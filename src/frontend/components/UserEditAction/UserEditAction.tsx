import { FC } from "react";
import {
    ActionProps,
    BaseActionComponent,
    BasePropertyJSON,
    useCurrentAdmin,
} from "adminjs";
import React from "react";

const UserEditAction: FC<ActionProps> = (props) => {
    const [currentAdmin] = useCurrentAdmin();
    const newProps = { ...props };
    newProps.action = { ...newProps.action, component: undefined };

    const mapper = (property: BasePropertyJSON) => {
        if (
            property.name === "role" &&
            (currentAdmin?.role === 2 || currentAdmin?.role === 3)
        ) {
            property.props = { className: "disabled-role" };
            property.availableValues = null;
            property.isDisabled = true;
        }

        return property;
    };

    const { resource } = newProps;

    resource.listProperties = resource.listProperties.map(mapper);
    resource.editProperties = resource.editProperties.map(mapper);
    resource.showProperties = resource.showProperties.map(mapper);
    resource.filterProperties = resource.filterProperties.map(mapper);

    return <BaseActionComponent {...newProps} />;
};

export default UserEditAction;
