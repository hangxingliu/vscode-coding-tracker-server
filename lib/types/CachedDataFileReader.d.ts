type CachedDataFileReader = {
	clearAllCache: () => void;
	clearCache: (fileName: string) => void;
	prepareFiles: (fileList: string[]) => Promise<number>;
	readFile: (fileName: string) => Promise<string>;
};
