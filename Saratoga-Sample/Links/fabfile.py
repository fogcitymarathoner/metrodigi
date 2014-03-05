from PIL import Image

page_max_size = 768, 1024
image_max_height = page_max_size[0]
image_max_width = page_max_size[1]
page2_image_file = '_DSC3887-a grey.tif'
page4_image_file = '08-037-51A grey.png'
def slice_page2():

    ratio = float(2024.0/1024.0)
    
    im = Image.open(page2_image_file)

    print im.size

    height = im.size[1]
    width = im.size[0]
    print height
    y_start = height - image_max_height
    x_start = 0
    print 'top corner: %s, %s'%(x_start, y_start)
    
    x_end = x_start + image_max_width * ratio
    y_end = y_start + image_max_height 


    print 'bottom corner: %s, %s'%(x_end, y_end)
    box = (x_start, y_start, x_end , y_end)
    print box
    box = (876, 858, 2900+ 360, 2376)
    region = im.crop(box)
    region.show()
    print region.size
    
    box = (0, 0, 2384 -  360, 1518)
    print box
    region2 = region.crop(box)
    #region2.show()
    
    s= region2.size
    #ratio = image_max_width/s[0]
    size = (int(s[0]/ratio), int(s[1]/ratio))
    print size
    newimg = region2.resize(size, Image.ANTIALIAS)

    newimg.show()

    newimg.save('page-2.png', "PNG")

    
    box = (2384 -  360, 0, 2384, 1518)

    region3 = region.crop(box)
    s= region3.size
    #ratio = image_max_width/s[0]
    
    size = (int(s[0]/ratio), int(s[1]/ratio))
    newimg = region3.resize(size, Image.ANTIALIAS)

    newimg.show()

    

    newimg.save('page-3.png', "PNG")
    quit()

    box = (2900, 858, 2900+360, 2376)
    region2 = im.crop(box)
    s= region2.size
    print s
    ratio = float(260.0/s[0])
    print ratio
    #region2.show()
    #region2.save('page-3.png', "PNG")

    newimg2 = region2.resize((int(s[0]*(ratio)), int(s[1]*ratio)), Image.ANTIALIAS)
    print newimg2.size
    newimg2.show()
    newimg2.save('page-3.png', "PNG")
    
def slice_page4():
    #print page4_image_file
    im = Image.open(page4_image_file)
    #im.show()
    #print im.size
    # 5408, 3842
    center = 2704
    bottom = 3288
    top_waste = 1000
    # cut off left piece
    

    lf_box = (0, 0, center, bottom)
    left_slice = im.crop(lf_box)
    #left_slice.show()
    # cut off right piece
    rt_box = (center+1, 0, 5408, bottom)
    right_slice = im.crop(rt_box)
    #right_slice.show()
    half_size = left_slice.size
    
    crop_box = (0, top_waste, half_size[0], half_size[1])

    left_cropped = left_slice.crop(crop_box)
    #left_cropped.show()

    right_cropped = right_slice.crop(crop_box)
    cropped_size = right_cropped.size
    #right_cropped.show()
    #print right_cropped.size
    # 2704, 2288
    # squeeze to 1024/2288
    ratio = 1024.0/2288.0
    #print cropped_size[0]
    #print ratio
    width = (int(cropped_size[0]*ratio))
    #print width
    height = int(cropped_size[1]*ratio)
    #print height
    right_sm = right_cropped.resize((1024, 512), Image.ANTIALIAS)
    
    right_sm.save('page-5-right.png', "PNG")
    #right_sm.show()
    left_sm = left_cropped.resize((1024, 512), Image.ANTIALIAS)
    #left_sm.show()
    left_sm.save('page-4-left.png', "PNG")
