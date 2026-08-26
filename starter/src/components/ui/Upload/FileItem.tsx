import FileIcon from './FileIcon'
import classNames from '../utils/classNames'
import type { CommonProps } from '../@types/common'
import type { ReactNode } from 'react'

const BYTE = 1000
const getKB = (bytes: number) => Math.round(bytes / BYTE)

export interface FileItemProps extends CommonProps {
    file: File
    closeButton: ReactNode
}

const FileItem = (props: FileItemProps) => {
    const { file, className, closeButton, children } = props
    const { name, size } = file

    return (
        <div className={classNames('upload-file', className)}>
            <div className="upload-file-wrapper">
                <div className="upload-file-info-wrapper">
                    <div className="upload-file-thumbnail">
                        {<FileIcon file={file} />}
                    </div>
                    <div className="upload-file-info">
                        <h6 className="upload-file-name">{name}</h6>
                        <span className="upload-file-size">
                            {getKB(size)} kb
                        </span>
                    </div>
                </div>
                {closeButton}
            </div>
            {children}
        </div>
    )
}

FileItem.displayName = 'UploadFileItem'

export default FileItem
