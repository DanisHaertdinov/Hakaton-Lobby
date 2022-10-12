interface IframeProps {
  width: string;
  height: string;
  src: string;
}

export const Iframe = ({ width, height, src }: IframeProps) => {
  return <iframe width={width} height={height} src={`https://${src}`} />;
};
