import File from '@/components/svg/files/File'
import FileDoc from '@/components/svg/files/FileDoc'
import FileXls from '@/components/svg/files/FileXls'
import FilePdf from '@/components/svg/files/FilePdf'
import FilePpt from '@/components/svg/files/FilePpt'
import FileImage from '@/components/svg/files/FileImage'
import Folder from '@/components/svg/files/Folder'

const FileIcon = ({ type, size = 30 }: { type: string; size?: number }) => {
    switch (type) {
        case 'pdf':
            return <FilePdf height={size} width={size} />
        case 'xlsx':
            return <FileXls height={size} width={size} />
        case 'docx':
            return <FileDoc height={size} width={size} />
        case 'ppt':
            return <FilePpt height={size} width={size} />
        case 'jpg':
            return <FileImage height={size} width={size} />
        case 'jpeg':
            return <FileImage height={size} width={size} />
        case 'png':
            return <FileImage height={size} width={size} />
        case 'directory':
            return <Folder height={size} width={size} />
        default:
            return <File height={size} width={size} />
    }
}

export default FileIcon
