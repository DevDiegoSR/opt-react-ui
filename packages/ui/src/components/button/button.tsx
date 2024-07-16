
type ButtonProps = React.ComponentPropsWithRef<"button"> & {
  backgroundColor?: string;
  label: string;
}

export const Button = ({ ...props }: ButtonProps) => {
  return (
    <button {...props}>123</button>
  )
}