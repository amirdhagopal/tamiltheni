import { h, render } from 'preact';
import { AppShell, AppShellProps } from './components/AppShell';

export type LayoutOptions = AppShellProps;

export const Layout = {
    init: function (options: LayoutOptions): void {
        let shellRoot = document.getElementById('app-shell-root');
        if (!shellRoot) {
            shellRoot = document.createElement('div');
            shellRoot.id = 'app-shell-root';
            document.body.insertBefore(shellRoot, document.body.firstChild);
        }
        render(h(AppShell, options), shellRoot);
    },

    collapsePanel: function (): void {
        document.dispatchEvent(new CustomEvent('requestPanelCollapse'));
    },
};
