import { Modal } from "@/components/modal-1";

export function MessagePayloadModal({
  open, payload, onClose,
}: { open: boolean; payload: string; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} width="560px" title="Message Payload">
      <pre className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-700 overflow-x-auto whitespace-pre">
        {payload}
      </pre>
    </Modal>
  );
}
