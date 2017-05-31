type ClassLoadingDialog = {
	loading(): void;
	failed(error: any): void;
	hide(): void;
}

declare var global: {
	app: {
		
	}
};