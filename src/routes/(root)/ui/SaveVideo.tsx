import { open, save } from '@tauri-apps/plugin-dialog'
import React, { useCallback } from 'react'
import { snapshot, useSnapshot } from 'valtio'

import Button from '@/components/Button'
import Icon from '@/components/Icon'
import { toast } from '@/components/Toast'
import Tooltip from '@/components/Tooltip'
import {
  copyFileToClipboard,
  moveFile,
  showItemInFileManager,
} from '@/tauri/commands/fs'
import { appProxy } from '../-state'

function SaveVideo() {
  const {
    state: { videos, isSaving, isSaved, isCompressing },
  } = useSnapshot(appProxy)
  const singleVideo = videos.length === 1 ? videos[0] : null

  const handleCompressedVideoSave = useCallback(async () => {
    if (appProxy.state.videos.length) {
      const { videos } = appProxy.state
      const isBatch = videos.length > 1
      const singleVideo = videos.length > 0 ? videos[0] : null
      const { compressedVideo, fileName } = singleVideo ?? {}

      try {
        let pathToSave: string | string[] | null = null

        if (isBatch) {
          const selectedDirectory = await open({
            directory: true,
            title: '选择用于保存压缩后视频的文件夹。',
          })
          if (selectedDirectory) {
            pathToSave = selectedDirectory as string
          }
        } else {
          pathToSave = await save({
            title: '选择压缩后视频的保存位置。',
            defaultPath: `compressO-${compressedVideo?.fileNameToDisplay ?? fileName ?? ''}`,
          })
        }

        if (pathToSave) {
          appProxy.state.isSaving = true
          appProxy.state.isSaved = false
          appProxy.state.savedPath = pathToSave

          if (isBatch) {
            const directory = pathToSave as string

            for (let i = 0; i < videos.length; i++) {
              const video = videos[i]
              if (video.compressedVideo?.pathRaw) {
                appProxy.state.videos[i].compressedVideo = {
                  ...(snapshot(appProxy).state.videos[i].compressedVideo ?? {}),
                  isSaving: true,
                  isSaved: false,
                }

                const destinationPath = `${directory}/compressO-${video?.compressedVideo?.fileNameToDisplay || video?.fileName}`

                await moveFile(video.compressedVideo.pathRaw, destinationPath)
                appProxy.state.videos[i].compressedVideo = {
                  ...(snapshot(appProxy).state.videos[i].compressedVideo ?? {}),
                  savedPath: destinationPath,
                  isSaving: false,
                  isSaved: true,
                }
              }
            }
            appProxy.state.isSaved = true
          } else {
            appProxy.state.videos[0].compressedVideo = {
              ...(snapshot(appProxy).state.videos[0].compressedVideo ?? {}),
              isSaving: true,
              isSaved: false,
            }
            await moveFile(
              compressedVideo?.pathRaw as string,
              pathToSave as string,
            )
            appProxy.state.videos[0].compressedVideo = {
              ...(snapshot(appProxy).state.videos[0].compressedVideo ?? {}),
              savedPath: pathToSave as string,
              isSaving: false,
              isSaved: true,
            }
            appProxy.state.isSaved = true
          }
        }
      } catch (_) {
        toast.error('无法将视频保存到指定路径。')
        for (let i = 0; i < videos.length; i++) {
          appProxy.state.videos[i].compressedVideo = {
            ...(snapshot(appProxy).state.videos[i].compressedVideo ?? {}),
            isSaving: false,
            isSaved: false,
          }
        }
      }
      appProxy.state.isSaving = false
    }
  }, [])

  const openInFileManager = async () => {
    const { videos } = appProxy.state
    const singleVideo = videos.length > 0 ? videos[0] : null
    const { compressedVideo } = singleVideo ?? {}

    const savedPath = appProxy.state.savedPath ?? compressedVideo?.savedPath
    if (!savedPath) return
    try {
      await showItemInFileManager(savedPath)
    } catch {}
  }

  const copyToClipboard = async () => {
    const { videos } = appProxy.state
    const singleVideo = videos.length > 0 ? videos[0] : null
    const { compressedVideo } = singleVideo ?? {}

    const savedPath =
      appProxy.state.savedPath ??
      compressedVideo?.savedPath ??
      compressedVideo?.pathRaw
    if (!savedPath) return

    try {
      await copyFileToClipboard(savedPath)
      toast.success('已复制到剪贴板。')
    } catch {}
  }

  return (
    <div className="flex items-center">
      <Button
        className="flex justify-center items-center"
        color="success"
        onPress={handleCompressedVideoSave}
        isLoading={isSaving}
        isDisabled={isSaving || isSaved}
        fullWidth
      >
        {isSaving
          ? '保存中...'
          : isSaved
            ? '已保存'
            : `保存视频${videos.length > 1 ? '' : ''}`}
        {!isSaving ? (
          <Icon name={isSaved ? 'tick' : 'save'} className="text-green-300" />
        ) : null}
      </Button>
      {isSaved ? (
        <>
          <Tooltip
            content="在文件管理器中显示"
            aria-label="在文件管理器中显示"
          >
            <Button
              isIconOnly
              className="ml-2 text-green-500"
              onPress={openInFileManager}
            >
              <Icon name="fileExplorer" />
            </Button>
          </Tooltip>
        </>
      ) : null}
      {!isCompressing &&
      singleVideo?.isProcessCompleted &&
      singleVideo?.compressedVideo?.isSuccessful ? (
        <Tooltip content="复制到剪贴板" aria-label="复制到剪贴板">
          <Button
            isIconOnly
            className="ml-2 text-green-500"
            onPress={copyToClipboard}
          >
            <Icon name="copy" size={28} />
          </Button>
        </Tooltip>
      ) : null}
    </div>
  )
}

export default React.memo(SaveVideo)
