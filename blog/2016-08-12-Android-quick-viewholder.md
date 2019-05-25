# Android - 通用 Viewholder
> 2016-08-12 01:30:00
在 iOS 开发中基本不会用到 Viewholder 这种神奇的模式, 所以第一次在 android 中看到还是挺懵逼的,感觉有点逗.
而且每次重复的写 viewholder 感觉很不 geek,所以在google 上搜到别人搜到的.....这一个通用的 viewholder 的方法
挺不错的.
```
public class ViewHolder {
    // I added a generic return type to reduce the casting noise in client code
    @SuppressWarnings("unchecked")
    public static <T extends View> T get(View view, int id) {
        SparseArray<View> viewHolder = (SparseArray<View>) view.getTag();
        if (viewHolder == null) {
            viewHolder = new SparseArray<View>();
            view.setTag(viewHolder);
        }
        View childView = viewHolder.get(id);
        if (childView == null) {
            childView = view.findViewById(id);
            viewHolder.put(id, childView);
        }
        return (T) childView;
    }
}
```
```
@Override
public View getView(int position, View convertView, ViewGroup parent) {
    if (convertView == null) {
        convertView = LayoutInflater.from(context)
          .inflate(R.layout.banana_phone, parent, false);
    }
    ImageView bananaView = ViewHolder.get(convertView, R.id.banana);
    TextView phoneView = ViewHolder.get(convertView, R.id.phone);
    BananaPhone bananaPhone = getItem(position);
    phoneView.setText(bananaPhone.getPhone());
    bananaView.setImageResource(bananaPhone.getBanana());
    return convertView;
}
```