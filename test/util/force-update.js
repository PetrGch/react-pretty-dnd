// @flow

// Forces a re-render via setProps({}) (same pattern enzyme used after
// wrapper.update() stopped forcing renders).
// Works with RTL mount helpers that expose setProps.

type HasSetProps = {|
  setProps: (next: Object) => void,
|};

export default (wrapper: HasSetProps) => wrapper.setProps({});
