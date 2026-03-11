import { open } from '@tauri-apps/plugin-shell'

import Icon from '@/components/Icon'
import Image from '@/components/Image'
import Title from '@/components/Title'
import TauriLink from '@/tauri/components/Link'

function About() {
  return (
    <section className="px-4 py-10 w-full">
      <section className="mb-2">
        <Title title="关于" iconProps={{ name: 'info' }} />
      </section>
      <section>
        <div className="z-10 flex justify-center items-center flex-col">
          <Image
            disableAnimation
            src="/logo.png"
            alt="logo"
            width={80}
            height={80}
          />
          <h2 className="block text-3xl font-bold text-primary">CompressO</h2>
        </div>
        <p className="text-center italic text-gray-600 dark:text-gray-400 text-sm my-1">
          将任意视频压缩到更小体积。
        </p>
      </section>
      <section className="my-8">
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm my-1 ">
          由{' '}
          <TauriLink href="https://ffmpeg.org/" className="text-lg">
            FFmpeg
          </TauriLink>
          <span className="block text-sm max-w-[400px] mx-auto">
            本软件使用 FFmpeg 项目的库，遵循 LGPLv2.1 协议。
          </span>
        </p>
      </section>
      <section>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm my-1">
          由 <Icon className="inline text-primary" name="lowResHeart" /> 用心公开打造：{' '}
          <TauriLink href="https://codeforreal.com">Code For Real⚡</TauriLink>
        </p>
      </section>
      <section>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 my-2  flex items-center justify-center">
          <button
            type="button"
            className="ml-2  flex items-center justify-center gap-2"
            onClick={() => {
              open('https://github.com/codeforreal1/compressO')
            }}
          >
            免费且开源{' '}
            <Icon
              name="github"
              size={25}
              className="text-gray-800 dark:text-gray-200"
            />
          </button>
        </p>
        <p className="text-center text-gray-600 dark:text-gray-400 text-xs my-1">
          简体中文翻译 By{' '}
          <TauriLink href="https://github.com/chenx221">Chenx221</TauriLink>
          、
          <TauriLink href="http://www.dayanzai.me/">大眼仔~旭</TauriLink>
        </p>
      </section>
      <p className="self-end text-zinc-600 dark:text-zinc-400 ml-2 text-lg font-bold text-center">
        v{window.__appVersion ?? ''}
      </p>
    </section>
  )
}

export default About
