import * as React from "react"
import { Button } from "./button"

const Modal = ({ isOpen, onClose, onConfirm, title, description, cancelText = "Cancel", confirmText = "Confirm", children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {description}
        </p>
        
        {children && <div className="mb-6">{children}</div>}
        
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { Modal }
