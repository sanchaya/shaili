import React, { FC } from "react";
import { Navigation } from "@adminjs/design-system";
import { ResourceJSON, useNavigationResources } from "adminjs";

export type SidebarResourceSectionProps = {
  resources: Array<ResourceJSON>;
};

const SidebarResources: FC<SidebarResourceSectionProps> = ({ resources }) => {
  const elements = useNavigationResources(resources);
  return <Navigation elements={elements} />;
};

export default SidebarResources;
