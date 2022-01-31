export default class ViewUtils {
  static captionText(isEditing: boolean) {
    return isEditing
      ? 'professions.form.captions.edit'
      : 'professions.form.captions.add';
  }
}
