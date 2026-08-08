import { createTheme } from "@mantine/core";
import classes from "./classes.module.css";

export const theme = createTheme({
  components: {
    TextInput: {
      classNames: {
        root: classes.root,
        input: classes.input,
        label: classes.label,
      },
    },
    Modal: {
      classNames: {
        title: classes.modalTitle,
        header: classes.modalHeader,
        content: classes.modalContent,
      },
    },
  },
});