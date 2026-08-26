import type { CommonProps } from '../@types/common'

export type FileIconProps = {
    file: File
}

const IconWraper = ({ children }: CommonProps) => {
    return <span className="upload-file-icon">{children}</span>
}

const FileIcon = ({ file }: FileIconProps) => {
    const renderIcon = () => {
        const { type } = file
        const isImageFile = type.split('/')[0] === 'image'
        const isVideo = type.split('/')[0] === 'video'

        if (isImageFile) {
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    className="upload-file-image"
                    src={URL.createObjectURL(file)}
                    alt={`file preview ${name}`}
                />
            )
        }

        if (isVideo) {
            return (
                <IconWraper>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth={0}
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="none"
                            strokeWidth={1.5}
                            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm-2.5-6.5 6-3.5-6-3.5v7Zm1-2 2-1.5-2-1.5v3Z"
                        />
                    </svg>
                </IconWraper>
            )
        }

        if (
            type === 'application/zip' ||
            type === 'application/x-zip-compressed'
        ) {
            return (
                <IconWraper>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth={0}
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="none"
                            strokeWidth={1.5}
                            d="M4.998 9V1H19.5L23 4.5V23H4M18 1v5h5M2 13h5v1l-4 4v1h5m3-7v8-8Zm4 1v7-7Zm5 2a2 2 0 0 0-2-2h-3v4h3a2 2 0 0 0 2-2Z"
                        />
                    </svg>
                </IconWraper>
            )
        }

        if (type === 'application/pdf' || type === 'application/vnd.rar') {
            return (
                <IconWraper>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth={0}
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="none"
                            strokeWidth={1.5}
                            d="M4.998 9V1H19.5L23 4.5V23H4M18 1v5h5M3 12h1.5c2 0 2.25 1.25 2.25 2s-.25 2-2.25 2H3.25v2H3v-6Zm6.5 6v-6h1.705c1.137 0 2.295.5 2.295 3s-1.158 3-2.295 3H9.5Zm7 1v-7h4m-4 3.5h3"
                        />
                    </svg>
                </IconWraper>
            )
        }

        return (
            <IconWraper>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth={0}
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="none"
                        strokeWidth={2}
                        d="M14 1v7h7m0 15H3V1h12l3 3 3 3v16Z"
                    />
                </svg>
            </IconWraper>
        )
    }

    return <>{renderIcon()}</>
}

export default FileIcon
