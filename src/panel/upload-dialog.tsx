import { useState } from "react";
import { FilePicker, type Picked, type PickerKind } from "./file-picker";
import { Button, DialogFooter, Modal } from "./ui";

/**
 * The one-file dialog for a cover, a recording or a resource's file: a `FilePicker` and the
 * button that hands the file on. It picks; it does not upload. Every caller gives the file to
 * the upload tray (`useUploads`) and closes at once.
 */
export function UploadDialog({
  title,
  description,
  kind,
  confirmLabel = "Upload",
  onFile,
  onClose,
}: {
  title: string;
  description?: string;
  kind: PickerKind;
  confirmLabel?: string;
  onFile: (file: File) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<Picked[]>([]);
  const file = picked.find((p) => !p.problem)?.file;

  return (
    <Modal title={title} description={description} onClose={onClose}>
      <FilePicker kind={kind} picked={picked} onChange={setPicked} />
      <DialogFooter onCancel={onClose}>
        <Button disabled={!file} onClick={() => file && onFile(file)}>
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Modal>
  );
}
