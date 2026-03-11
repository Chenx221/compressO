import { UseDisclosureProps, useDisclosure } from '@heroui/react'
import React from 'react'
import { snapshot, useSnapshot } from 'valtio'

import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Tooltip from '@/components/Tooltip'
import { deleteFile } from '@/tauri/commands/fs'
import AlertDialog, { AlertDialogButton } from '@/ui/Dialogs/AlertDialog'
import { appProxy } from '../-state'

function CompressionActions() {
  const {
    state: { videos, isProcessCompleted, isLoadingFiles, isSaving },
    resetProxy,
  } = useSnapshot(appProxy)

  const alertDiscloser = useDisclosure()

  const handleDiscard = async ({
    closeModal,
  }: {
    closeModal: UseDisclosureProps['onClose']
  }) => {
    try {
      const deletePromises = videos
        .flatMap((video) => [
          video.compressedVideo?.pathRaw
            ? deleteFile(video.compressedVideo.pathRaw)
            : null,
          video.thumbnailPathRaw ? deleteFile(video.thumbnailPathRaw) : null,
        ])
        .filter(Boolean)

      await Promise.allSettled(deletePromises)
      closeModal?.()
      resetProxy()
    } catch {}
  }

  const handleCancelCompression = () => {
    const appSnapshot = snapshot(appProxy)
    if (appSnapshot.state.isProcessCompleted && !appSnapshot.state.isSaved) {
      alertDiscloser.onOpen()
    } else {
      resetProxy()
    }
  }

  const handleReconfigure = () => {
    appProxy.timeTravel('beforeCompressionStarted')
  }

  return videos.length && !isLoadingFiles ? (
    <>
      <div className="w-fit flex justify-center items-center z-[10]">
        {isProcessCompleted ? (
          <Tooltip content="重置" aria-label="重置">
            <Button
              size="sm"
              onPress={handleReconfigure}
              variant="light"
              radius="full"
              className="gap-1"
              isDisabled={isSaving}
              isIconOnly
            >
              <Icon name="redo" size={22} />{' '}
            </Button>
          </Tooltip>
        ) : null}
        <Tooltip content="退出" aria-label="退出">
          <Button
            size="sm"
            onPress={handleCancelCompression}
            variant={'light'}
            radius="full"
            className="gap-1"
            isDisabled={isSaving}
            isIconOnly
          >
            <Icon name="cross" size={22} />
          </Button>
        </Tooltip>
      </div>
      <AlertDialog
        title={`视频${videos.length > 1 ? '尚未保存' : '尚未保存'}`}
        discloser={alertDiscloser}
        description={`压缩后的视频${videos.length > 1 ? '尚未保存' : '尚未保存'}，确定要丢弃吗？`}
        renderFooter={({ closeModal }) => (
          <>
            <AlertDialogButton onPress={closeModal}>返回</AlertDialogButton>
            <AlertDialogButton
              color="danger"
              onPress={() => handleDiscard({ closeModal })}
            >
              确定
            </AlertDialogButton>
          </>
        )}
      />
    </>
  ) : null
}

export default React.memo(CompressionActions)
