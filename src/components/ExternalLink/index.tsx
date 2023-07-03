import type { Component, JSX } from "solid-js";

export type ExternalLinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement>;
const ExternalLink: Component<ExternalLinkProps> = (props) => {
    return <a rel="noopener noreferrer" target="_blank" {...props} />;
};

export default ExternalLink;
