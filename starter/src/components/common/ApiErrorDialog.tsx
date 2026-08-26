"use client";

import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

interface ApiErrorDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const ApiErrorDialog = ({
  isOpen,
  title = "خطا در انجام عملیات",
  message,
  onClose,
}: ApiErrorDialogProps) => {
  return (
    <Dialog lockScroll isOpen={isOpen} onClose={onClose}>
      <div className="min-w-[280px] max-w-md">
        <h5 className="mb-4 text-red-600">{title}</h5>

        <p className="whitespace-pre-line leading-7 text-gray-700 dark:text-gray-200">
          {message}
        </p>

        <div className="mt-6 text-left">
          <Button variant="solid" onClick={onClose}>
            متوجه شدم
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ApiErrorDialog;
