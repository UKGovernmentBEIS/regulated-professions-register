export default class ViewUtils {
  static captionText(editing: boolean) {
    return editing
      ? 'professions.form.captions.edit'
      : 'professions.form.captions.add';
  }
}
