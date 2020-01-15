// Logger
import debug from 'debug';
const log = debug('app:Comment2');

// Packages
import React, { useState, useRef } from 'react';
import { liveChatClient, App } from '@src/store/liveChatClient';
import { Transition } from 'react-transition-group';
import { useIntersection } from 'use-intersection';

export function Comment({ message, flameoutMsec, screenWidth }: Props) {
  const target = useRef<HTMLDivElement>(null);
  const [isClearLane, setIsClearLane] = useState(0);
  const intersecting = useIntersection(target, {
    rootMargin: `0% 0% 0% -99%`,
  });
  if (isClearLane === 0 && intersecting) setIsClearLane(1);
  if (isClearLane === 1 && !intersecting) {
    setIsClearLane(2);
    liveChatClient.clearLane({commentId: message.commentId, width: message.width});
  }
  const [isUpdatedWidth, updateWidth] = useState<boolean>(false);
  const defaultStyle: React.CSSProperties = {
    whiteSpace: 'nowrap',
    fontSize: `${liveChatClient.state.fontSize}px`,
    position: 'absolute',
    transform: `translateX(${screenWidth}px)`,
    transition: `transform ${flameoutMsec}ms linear`,
  };
  const [transitionStyles, setTransitionStyles] = useState<TransitionStyles>({
    entering: { transform: `translateX(-${message.width||0}px)` },
    entered:  { transform: `translateX(-${message.width||0}px)` },
    exiting:  { transform: `translateX(${screenWidth}px)` },
    exited:  { transform: `translateX(${screenWidth}px)` },
  });
  const setWidth = (instance: HTMLDivElement | null) => {
    const width = instance?.offsetWidth;
    if (isUpdatedWidth || message.width !== 0 || !width) return;
    updateWidth(true);
    liveChatClient.setWidth({commentId: message.commentId, width});
    setTransitionStyles({
      entering: { transform: `translateX(-${width}px)` },
      entered:  { transform: `translateX(-${width}px)` },
      exiting:  { transform: `translateX(${screenWidth}px)` },
      exited:  { transform: `translateX(${screenWidth}px)` },
    });
    return;
  }
  const onEntered = () => {
    if (message.width === undefined) return;
    liveChatClient.setExited({ commentId: message.commentId, width: message.width });
  };

  return (
    <Transition
      in={message.width !== 0}
      timeout={flameoutMsec}
      onEntered={onEntered}
    >
      {state => (
        <div
          style={{
            ...defaultStyle,
            top: `${message.top}px`,
            ...transitionStyles[state],
          }}
          ref={setWidth}
        >
          <div
            className='comments'
            ref={target}
          >
            {message.text}
          </div>
        </div>
      )}
    </Transition>
  );
}

interface Props {
  message: App.DisplayedMessage;
  flameoutMsec: number;
  screenWidth: number;
}

export interface TransitionStyles {
  entering?: React.CSSProperties,
  entered?: React.CSSProperties,
  exiting?: React.CSSProperties,
  exited?: React.CSSProperties,
  unmounted?: React.CSSProperties,
}
