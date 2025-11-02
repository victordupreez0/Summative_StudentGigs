import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from './button';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  type = 'default', // 'default', 'alert', 'confirm', 'success', 'error', 'info'
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
      case 'alert':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      default:
        return null;
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {typeof children === 'string' ? (
            <p className="text-gray-700 whitespace-pre-line">{children}</p>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Convenience hook for using modals
export const useModal = () => {
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'default',
    onConfirm: null,
    onCancel: null
  });

  const showAlert = React.useCallback(({ title = 'Alert', message, type = 'info' }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: null
      });
    });
  }, []);

  const showConfirm = React.useCallback(({ title = 'Confirm', message, type = 'default' }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const closeModal = React.useCallback(() => {
    if (modalState.onCancel) {
      modalState.onCancel();
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, [modalState]);

  const ModalComponent = React.useMemo(() => (
    <Modal
      isOpen={modalState.isOpen}
      onClose={closeModal}
      title={modalState.title}
      type={modalState.type}
      footer={
        <>
          {modalState.onCancel && (
            <Button
              variant="outline"
              onClick={() => {
                modalState.onCancel();
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={() => {
              modalState.onConfirm();
            }}
          >
            {modalState.onCancel ? 'Confirm' : 'OK'}
          </Button>
        </>
      }
    >
      {modalState.message}
    </Modal>
  ), [modalState, closeModal]);

  return {
    showAlert,
    showConfirm,
    ModalComponent
  };
};

export default Modal;
