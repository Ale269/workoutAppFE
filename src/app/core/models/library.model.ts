export interface LibraryFolder {
    id: string;
    name: string;
    parentId?: string;
    yachtId: string;
    files: LibraryFile[];
    subfolders: LibraryFolder[];
    createdAt: Date;
    updatedAt: Date;
}

export interface LibraryFile {
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    folderId: string;
    uploadedBy: string;
    createdAt: Date;
    updatedAt: Date;
}
