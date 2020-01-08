// Logger
import debug from 'debug';
const log = debug('app:comment');

// Packages
import React, { useState } from 'react';
import { Transition } from 'react-transition-group';

export function Comment(props: Props) {
  const defaultStyle: React.CSSProperties = {
    whiteSpace: 'nowrap',
    fontSize: `${props.fontSize}px`,
    position: 'absolute',
    transform: `translateX(${props.screenWidth}px)`,
    transition: `transform ${props.presetFlameoutUsec / 1000}ms linear`,
  };
  const [width, setWidth] = useState<number|undefined>(undefined);
  const [transitionStyles, setTransitionStyles] = useState<TransitionStyles>({
    entering: { transform: `translateX(-${width||0}px)` },
    entered:  { transform: `translateX(-${width||0}px)` },
    exiting:  { transform: `translateX(${props.screenWidth}px)` },
    exited:  { transform: `translateX(${props.screenWidth}px)` },
  });
  const updateWidth = (node: HTMLDivElement | null) => {
    if (width || props.width || !props.setWidth || !node?.offsetWidth) return
    setWidth(node.offsetWidth);
    props.setWidth({ commentId: props.commentId, width: node.offsetWidth, timestampUsec: props.timestampUsec });
    setTransitionStyles({
      entering: { transform: `translateX(-${node.offsetWidth}px)` },
      entered:  { transform: `translateX(-${node.offsetWidth}px)` },
      exiting:  { transform: `translateX(${props.screenWidth}px)` },
      exited:  { transform: `translateX(${props.screenWidth}px)` },
    });
    return
  };

  return (
    <Transition
      in={Boolean(props.width) && (props.top !== undefined)}
      timeout={props.presetFlameoutUsec / 1000}
      onEntered={()=>props.setExited(props.commentId)}
    >
      {state => (
        <div
          style={{
            ...defaultStyle,
            top: `${props.top}px`,
            ...transitionStyles[state],
          }}
          ref={updateWidth}
        >
          {props.text}
        </div>
      )}
    </Transition>
  );
}

export interface TransitionStyles {
  entering?: React.CSSProperties,
  entered?: React.CSSProperties,
  exiting?: React.CSSProperties,
  exited?: React.CSSProperties,
  unmounted?: React.CSSProperties,
}

export interface Props {
  commentId: string,
  text: string,
  fontSize: number,
  timestampUsec: string,

  /** この位置から遷移開始 */
  screenWidth: number,

  /** コメント要素のwidth 遷移先を決定するために必要 初期値undefined以外になったときに遷移開始 */
  width?: number,

  /** コメントの垂直位置 */
  top?: number,

  /** この時間かけて遷移する */
  presetFlameoutUsec: number,

  /** コメント要素のwidthを親に伝える */
  setWidth?: ({ commentId, width, timestampUsec }: {commentId: string, width: number, timestampUsec: string})=>void,

  /** 遷移が完了したら呼び出して該当コメントを削除する */
  setExited: (id: string) => void,
}
