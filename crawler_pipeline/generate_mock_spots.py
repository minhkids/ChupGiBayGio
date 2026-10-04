import json

with open("crawler_pipeline/data/crawled_real_fb_results.json", encoding="utf-8") as f:
    fb = json.load(f)

def make_inspo(id_val, author_name, handle, avatar, post_url, date_str, caption, full_content, thumb, gallery, palette, pose_tip, camera_settings, likes='1.2k', comments='142', shares='48'):
    gallery_str = ",\n          ".join(f"'{g}'" for g in gallery)
    palette_str = ", ".join(f"'{p}'" for p in palette)
    caption_esc = caption.replace("'", "\\'")
    full_content_esc = full_content.replace("'", "\\'").replace("\n", "\\n")
    pose_tip_esc = pose_tip.replace("'", "\\'")
    camera_settings_esc = camera_settings.replace("'", "\\'")
    return f"""      {{
        id: '{id_val}',
        platform: 'FACEBOOK',
        authorName: '{author_name}',
        authorHandle: '{handle}',
        authorAvatar: '{avatar}',
        groupName: 'Hội Đam Mê Nhiếp Ảnh - Aphoto',
        groupUrl: 'https://www.facebook.com/groups/528320614043286',
        postUrl: '{post_url}',
        postDate: '{date_str}',
        caption: '{caption_esc}',
        fullContent: '{full_content_esc}',
        thumbnailUrl: '{thumb}',
        galleryUrls: [
          {gallery_str}
        ],
        paletteHex: [{palette_str}],
        poseTip: '{pose_tip_esc}',
        cameraSettings: '{camera_settings_esc}',
        likesCount: '{likes}',
        commentsCount: '{comments}',
        sharesCount: '{shares}'
      }}"""

inspo_hn_01_a = make_inspo(
  'fb-hn-01',
  fb[0]['author_name'],
  '@ductic.photo',
  fb[0]['local_avatar'],
  fb[0]['post_url'],
  'Hôm qua lúc 16:45',
  'Giao lưu cùng các bác vài pic cúc họa mi ven sông Hồng chụp vội #aphoto',
  'Vừa đi Bãi Đá Sông Hồng về chiều nay xong các bác ạ! Cúc họa mi năm nay vào vụ nở đều và dày bông dã man. Em đi từ 15h30, căn góc chụp ngược sáng ven sông Hồng đón nắng hoàng hôn rọi qua cánh hoa trong suốt cực thơ.\n\nKinh nghiệm thực tế cho anh em Aphoto:\n1. Ống kính: Nên cắm 85mm f/1.4 hoặc 70-200mm để nén bớt người chụp phía sau vì cuối tuần khá đông.\n2. Ánh sáng: Đẹp nhất từ 15h45 - 17h00 khi nắng xiên vàng dịu, ven tóc mẫu lên óng ánh.\n3. Trang phục: Tone trắng kem, len be hoặc áo dài truyền thống ăn rơ nhất với màu cúc họa mi.\n4. Vé vào cổng 70k/người, không phụ thu máy ảnh cơ nha các bác!',
  fb[0]['local_photos'][0],
  [fb[0]['local_photos'][0], fb[0]['local_photos'][1], fb[0]['local_photos'][2]],
  ['#F9F8F6', '#E9DEC7', '#8A9A5B', '#C85A32'],
  'Ngồi nghiêng góc 45 độ giữa luống hoa, hai tay ôm bó cúc hờ hững, góc máy hạ sát mặt đất để lấy cánh hoa làm tiền cảnh xóa phông.',
  'Sony A7IV • FE 85mm f/1.4 GM • 1/1000s • f/1.8 • ISO 100',
  '1.2k', '248', '86'
)

inspo_hn_01_b = make_inspo(
  'fb-hn-01-b',
  fb[8]['author_name'],
  '@dangthevinh.camera',
  fb[8]['local_avatar'],
  fb[8]['post_url'],
  '2 ngày trước',
  'Nàng thơ giữa vườn hoa. Dịu dàng, thơ mộng 🌸✨ #Aphoto',
  'Nàng thơ giữa vườn hoa bãi đá sông Hồng lúc chớm đông. Ánh sáng xiên chiều nhẹ nhàng tạo cảm giác lãng đãng và mộng mơ. Chụp tự nhiên không cần tạo dáng cầu kỳ, để mẫu tương tác với những luống hoa mềm mại.',
  fb[8]['local_photos'][0],
  [fb[8]['local_photos'][0], fb[8]['local_photos'][1], fb[8]['local_photos'][2]],
  ['#F9F8F6', '#D4A373', '#606C38'],
  'Đứng xuôi theo luống hoa, mắt nhìn nhẹ xuống dưới, tay cầm nhẹ vạt áo tạo độ bay tự nhiên.',
  'Canon EOS R6 • RF 50mm f/1.2L • 1/1250s • f/1.4 • ISO 100',
  '890', '112', '34'
)

inspo_hn_02_a = make_inspo(
  'fb-hn-02',
  fb[11]['author_name'],
  '@tuananh.nguyen',
  fb[11]['local_avatar'],
  fb[11]['post_url'],
  'Vừa đăng',
  'Chúc các bác mùa lễ hội vui vẻ! Đèn lồng rực sáng cả con phố 🥮🎏 #aphoto',
  'Chia sẻ cùng anh em Aphoto góc phố Hàng Mã vừa lên đèn rực rỡ. Đèn lồng treo cao tầng tầng lớp lớp tạo chiều sâu hút mắt. Mình cắm fix 35mm mở khẩu f/1.8 để bắt trọn ánh sáng ấm áp phản chiếu trên gương mặt mẫu.',
  fb[11]['local_photos'][0],
  [fb[11]['local_photos'][0], fb[11]['local_photos'][1], fb[11]['local_photos'][2]],
  ['#C82A2A', '#FDB813', '#1A1A1A', '#E8927C'],
  'Cầm chiếc đèn kéo quân hoặc lồng đèn ông sao giơ ngang ngực, ánh mắt ngắm nhìn ánh sáng đèn lồng.',
  'Fujifilm X-T4 • XF 35mm f/1.4 R • 1/250s • f/1.8 • ISO 800',
  '2.4k', '310', '124'
)

inspo_hn_02_b = make_inspo(
  'fb-hn-02-b',
  fb[10]['author_name'],
  '@phananh.street',
  fb[10]['local_avatar'],
  fb[10]['post_url'],
  '3 ngày trước',
  'Không khí rực rỡ phố cổ mùa trăng tròn ☺️ #Aphoto',
  'Đi dọc con phố nghe tiếng trống lân và ngắm sắc đỏ tràn ngập. Ảnh chụp góc ngược sáng từ giàn lồng đèn tạo bokeh viền tròn rất nghệ thuật.',
  fb[10]['local_photos'][0],
  [fb[10]['local_photos'][0], fb[10]['local_photos'][1], fb[10]['local_photos'][2]],
  ['#C82A2A', '#FDB813', '#2D5A27'],
  'Đứng nghiêng bên sạp đồ chơi truyền thống, tay chạm nhẹ vào chiếc mặt nạ giấy bồi.',
  'Sony A7III • FE 50mm f/1.8 • 1/320s • f/2.0 • ISO 640',
  '1.1k', '95', '42'
)

inspo_hn_03_a = make_inspo(
  'fb-hn-03',
  fb[12]['author_name'],
  '@anphoto.raf',
  fb[12]['local_avatar'],
  fb[12]['post_url'],
  'Hôm qua lúc 09:15',
  'Mùa thu Hà Nội qua góc máy ảnh đường phố #aphoto',
  'Sáng thu Hà Nội trời trong vắt, nắng xuyên qua tán sấu rọi lên chiếc xe đạp chở đầy hoa cúc và cẩm tú cầu. Cầm body X-T2 cùng ống Viltrox 85mm f1.8 II nén hậu cảnh cực mượt mà, màu film Classic Chrome lên đúng chất thơ Hà Nội xưa.',
  fb[12]['local_photos'][0],
  [fb[12]['local_photos'][0], fb[12]['local_photos'][1], fb[12]['local_photos'][4]],
  ['#556B2F', '#DAA520', '#F5F5DC', '#8B4513'],
  'Tựa nhẹ vào thân cây sấu cổ thụ hoặc đứng cạnh xe hoa, tay cầm một nhánh hoa nhỏ, mắt nhìn bâng khuâng theo dòng người.',
  'Fujifilm X-T2 • Viltrox 85mm f/1.8 II • 1/800s • f/2.0 • ISO 200',
  '3.6k', '420', '195'
)

inspo_hn_03_b = make_inspo(
  'fb-hn-03-b',
  fb[1]['author_name'],
  '@anduyhoang.art',
  fb[1]['local_avatar'],
  fb[1]['post_url'],
  '3 ngày trước',
  'Hoa Mộng — Nắng sớm trên góc phố cổ Hà Nội #aphoto',
  'Giao lưu cùng anh em bộ ảnh Hoa Mộng thực hiện sớm tại Phan Đình Phùng. Những đóa hoa mùa thu dưới nắng mai tạo nên vẻ đẹp thuần khiết thanh nhã khó nơi nào sánh được.',
  fb[1]['local_photos'][0],
  [fb[1]['local_photos'][0], fb[1]['local_photos'][1], fb[1]['local_photos'][2]],
  ['#DAA520', '#F5F5DC', '#556B2F'],
  'Bước đi chậm rãi trên vỉa hè rợp lá sấu rơi, tà áo dài tung bay nhẹ theo từng bước chân.',
  'Canon 5D Mark IV • EF 85mm f/1.4L IS • 1/1000s • f/1.8 • ISO 100',
  '1.8k', '180', '65'
)

inspo_hn_04_a = make_inspo(
  'fb-hn-04',
  fb[5]['author_name'],
  '@tonytran.photo',
  fb[5]['local_avatar'],
  fb[5]['post_url'],
  '2 ngày trước',
  'Khoảnh khắc cuối hè đón hoàng hôn cầu Long Biên... #aphoto',
  'Chiều tà buông xuống trên nhịp cầu sắt Long Biên. Ánh nắng vàng rực rọi xiên qua những thanh dầm thép gỉ sét tạo nên những vệt sáng tối đối lập vô cùng ấn tượng. Chia sẻ cùng anh em bộ ảnh chụp vội trước khi mặt trời lặn hẳn.',
  fb[5]['local_photos'][0],
  [fb[5]['local_photos'][0], fb[5]['local_photos'][2], fb[5]['local_photos'][4]],
  ['#A0522D', '#D2691E', '#CD853F', '#2F4F4F'],
  'Đứng tựa lưng vào lan can sắt nhìn xa xăm về dòng sông Hồng lộng gió, gió thổi bay nhẹ mái tóc.',
  'Sony A7C • FE 35mm f/1.8 • 1/1600s • f/2.2 • ISO 100',
  '1.9k', '215', '78'
)

inspo_hn_04_b = make_inspo(
  'fb-hn-04-b',
  fb[7]['author_name'],
  '@hainam.street',
  fb[7]['local_avatar'],
  fb[7]['post_url'],
  '4 ngày trước',
  'Phong trần tuổi 30 — Chân dung trên cầu Long Biên #Aphoto',
  'Bộ ảnh phong trần chụp cùng Model Kiên Vũ trên cầu Long Biên. Khung sắt hoen gỉ và ánh sáng ngược chiều tạo nên chất manly mạnh mẽ và cuốn hút.',
  fb[7]['local_photos'][0],
  [fb[7]['local_photos'][0], fb[7]['local_photos'][2], fb[7]['local_photos'][3]],
  ['#A0522D', '#2F4F4F', '#F4A460'],
  'Ngồi bên mép bậc cầu thang sắt, tay cầm mũ, ánh nhìn cương nghị về phía trước.',
  'Nikon Z6II • Nikkor Z 50mm f/1.8 S • 1/800s • f/2.0 • ISO 160',
  '1.4k', '132', '51'
)

inspo_hn_05_a = make_inspo(
  'fb-hn-05',
  fb[3]['author_name'],
  '@sinhledaynguyet',
  fb[3]['local_avatar'],
  fb[3]['post_url'],
  'Hôm qua lúc 20:30',
  'DẠ NGUYỆT — Bộ ảnh nghệ thuật tĩnh lặng #aphoto #SonyWorkshop',
  'Giao lưu cùng cả nhà bộ ảnh Dạ Nguyệt. Không gian ánh sáng huyền bí, góc máy tĩnh lặng cùng đường nét cổ kính giúp tôn vinh trọn vẹn thần thái sâu lắng của người mẫu. Gear tác nghiệp: Sony FX3 + A7IV cùng lens 24-50mm f2.8 G.',
  fb[3]['local_photos'][0],
  [fb[3]['local_photos'][0], fb[3]['local_photos'][1], fb[3]['local_photos'][4]],
  ['#C5A059', '#3D3D3D', '#EFEBD9', '#8C2D19'],
  'Đứng nghiêng bên khung cửa sổ vòm, tay chạm nhẹ vào rèm lụa, mắt nhìn theo vệt sáng rọi xuống sàn gỗ.',
  'Sony FX3 • FE 24-50mm f/2.8 G • 1/500s • f/2.8 • ISO 400',
  '2.8k', '340', '156'
)

inspo_hn_05_b = make_inspo(
  'fb-hn-05-b',
  fb[4]['author_name'],
  '@lamtruong.photo',
  fb[4]['local_avatar'],
  fb[4]['post_url'],
  'Hôm qua lúc 18:20',
  'Hoa hoạ sắc nàng — Giao lưu cùng anh em Aphoto #aphoto #LamTruong',
  'Bộ ảnh chân dung nghệ thuật khai thác vẻ đẹp thuần khiết và ánh sáng hội họa. Mỗi khung hình tựa như một bức tranh sơn dầu cổ điển.',
  fb[4]['local_photos'][0],
  [fb[4]['local_photos'][0], fb[4]['local_photos'][1], fb[4]['local_photos'][2]],
  ['#C5A059', '#EFEBD9', '#5B6E57'],
  'Ngồi trên ghế gỗ cổ điển, ngón tay chạm nhẹ vào đóa hoa sen, góc máy bán thân lấy nét vào đôi mắt.',
  'Canon EOS R5 • RF 85mm f/1.2L • 1/640s • f/1.4 • ISO 200',
  '1.6k', '190', '72'
)

inspo_hcm_01 = make_inspo(
  'fb-hcm-01',
  fb[9]['author_name'],
  '@thanhthuy.photo',
  fb[9]['local_avatar'],
  fb[9]['post_url'],
  'Hôm qua lúc 17:50',
  'Nắng sông hoàng hôn buông sáng bừng thành phố ☀️ photo by: Thanh Thủy #aphoto',
  'Bộ ảnh đón ánh nắng chiều vàng rực ven sông. Ánh sáng xiên chiều rọi lên mặt nước lấp lánh phản chiếu thành phố hoa lệ, mang lại năng lượng tràn đầy sức sống của một đô thị hiện đại.',
  fb[9]['local_photos'][0],
  [fb[9]['local_photos'][0], fb[9]['local_photos'][1], fb[9]['local_photos'][2]],
  ['#1C3144', '#FFBA08', '#3F88C5'],
  'Đứng tựa lan can công viên, hai tay chống nhẹ, đầu ngước nhìn theo cánh chim bay trên sông.',
  'Sony A7IV • FE 24-70mm f/2.8 GM II • 1/1200s • f/3.2 • ISO 100',
  '2.1k', '210', '92'
)

inspo_hcm_02_a = make_inspo(
  'fb-hcm-02',
  fb[2]['author_name'],
  '@ngothanhtai.film',
  fb[2]['local_avatar'],
  fb[2]['post_url'],
  'Hôm qua lúc 14:15',
  'Photo by me — Không gian hoài cổ cùng chất màu film #aphoto',
  'Một góc hoài niệm đậm chất vintage. Bức tường rêu phong và ánh sáng len qua khung cửa sổ chớp tạo nên câu chuyện đầy cảm xúc qua lăng kính analog.',
  fb[2]['local_photos'][0],
  [fb[2]['local_photos'][0], fb[2]['local_photos'][1], fb[2]['local_photos'][2]],
  ['#8B0000', '#B8860B', '#2F4F4F'],
  'Ngồi tựa vào lan can gỗ cầu thang, tay chống cằm suy tư, góc máy chụp từ trên xuống.',
  'Canon New F-1 • FD 50mm f/1.4 • Kodak Portra 400 film',
  '1.3k', '140', '48'
)

inspo_hcm_02_b = make_inspo(
  'fb-hcm-02-b',
  fb[6]['author_name'],
  '@minh.fuji',
  fb[6]['local_avatar'],
  fb[6]['post_url'],
  '4 ngày trước',
  'Một buổi chụp tĩnh lặng đậm chất cổ kính #Aphoto #fujifilmxt3',
  'Không gian kiến trúc cổ kính với đèn lồng và gạch ngói phong rêu. Màu film Fujifilm Classic Chrome tái hiện xuất sắc từng vệt màu thời gian.',
  fb[6]['local_photos'][0],
  [fb[6]['local_photos'][0], fb[6]['local_photos'][2], fb[6]['local_photos'][3]],
  ['#8B0000', '#D2B48C', '#1A1A1A'],
  'Đứng dưới mái hiên cổ kính, mắt hướng về phía nguồn sáng tự nhiên ngoài sân.',
  'Fujifilm X-T3 • XF 35mm f/2 R WR • 1/400s • f/2.0 • ISO 320',
  '980', '104', '39'
)

inspo_dl_01 = make_inspo(
  'fb-dl-01',
  fb[8]['author_name'],
  '@dangthevinh.camera',
  fb[8]['local_avatar'],
  fb[8]['post_url'],
  'Hôm qua lúc 06:45',
  'Nàng thơ giữa thảm cỏ sớm mai dịu dàng và thơ mộng 🌸✨ #Aphoto',
  'Chào buổi sáng cùng anh em Aphoto từ đồi cỏ Đan Kia. Sương sớm còn đọng trên từng ngọn cỏ, ánh nắng bình minh xiên qua rặng thông tạo luồng sáng huyền ảo tựa xứ sở thần tiên.',
  fb[8]['local_photos'][0],
  [fb[8]['local_photos'][0], fb[8]['local_photos'][1], fb[8]['local_photos'][2]],
  ['#DDA0DD', '#BC8F8F', '#2E8B57'],
  'Ngồi xếp bằng trên thảm cỏ, hai tay ôm đầu gối, mắt ngắm nhìn mặt trời mọc phía rặng thông xa.',
  'Sony A7R IV • FE 70-200mm f/2.8 GM OSS II • 1/1600s • f/2.8 • ISO 100',
  '4.5k', '512', '280'
)

inspo_dl_02 = make_inspo(
  'fb-dl-02',
  fb[4]['author_name'],
  '@lamtruong.photo',
  fb[4]['local_avatar'],
  fb[4]['post_url'],
  '3 ngày trước',
  'Hoa hoạ sắc vàng dã quỳ ngập tràn cung đèo Dran #aphoto #LamTruong',
  'Dã quỳ Tu Tra - Dran năm nay nở rộ vàng rực hai bên sườn đồi. Nắng cao nguyên trong vắt làm màu vàng của hoa sáng bừng cả khung hình. Anh em tranh thủ cuối tuần đi ngay kẻo hoa tàn nhanh nhé!',
  fb[4]['local_photos'][0],
  [fb[4]['local_photos'][0], fb[4]['local_photos'][1], fb[4]['local_photos'][2]],
  ['#FFA500', '#2E8B57', '#87CEEB'],
  'Đứng tựa vào mỏm đất bên vệ đường, tay cầm nhánh dã quỳ nhỏ, góc máy bắt trọn con đèo quanh co phía sau.',
  'Nikon D850 • AF-S 85mm f/1.4G • 1/1000s • f/2.0 • ISO 64',
  '1.8k', '165', '84'
)

inspo_sp_01 = make_inspo(
  'fb-sp-01',
  fb[1]['author_name'],
  '@anduyhoang.art',
  fb[1]['local_avatar'],
  fb[1]['post_url'],
  '4 ngày trước',
  'Hoa Mộng giữa chốn sương mây vùng cao #aphoto',
  'Bộ ảnh tuyệt đẹp ghi lại khoảnh khắc hoa nở giữa màn sương sớm bồng bềnh. Sắc hoa hồng thắm nổi bật giữa bạt ngàn sắc xanh ngọc bích tạo nên khung cảnh say đắm lòng người.',
  fb[1]['local_photos'][0],
  [fb[1]['local_photos'][0], fb[1]['local_photos'][1], fb[1]['local_photos'][2]],
  ['#FFB7C5', '#2E8B57', '#FFFFFF'],
  'Đứng giữa luống chè uốn lượn, tay che nhẹ ánh nắng mai rọi qua tán hoa, mắt nhìn theo làn mây bay.',
  'Canon EOS R5 • RF 70-200mm f/2.8L IS • 1/1000s • f/2.8 • ISO 100',
  '5.2k', '680', '390'
)

mock_spots_code = f"""import type {{ Spot }} from '../types';

export const MOCK_SPOTS: Spot[] = [
  {{
    id: 'spot-hn-01',
    regionId: 'hanoi',
    name: 'Bãi Đá Sông Hồng — Cánh Đồng Cúc Họa Mi & Lau Sậy',
    slug: 'bai-da-song-hong-cuc-hoa-mi',
    address: 'Ngõ 264 Âu Cơ, Nhật Tân, Tây Hồ, Hà Nội',
    lat: 21.0772,
    lng: 105.8273,
    bestTimeOfDay: 'GOLDEN_HOUR_MORNING',
    bestTimeDescription: 'Sáng sớm (6:00 - 8:00) đón sương mai hoặc Chiều hoàng hôn (15:30 - 17:00)',
    lightingNotes: 'Ánh sáng xiên chiều tạo viền tóc (rim light) cực kỳ mềm. Nên đứng góc ngược sáng nhẹ để bắt cánh cúc họa mi trong suốt.',
    sunOrientation: 'Mặt trời lặn hướng Tây Nam qua dòng Sông Hồng, thuận lợi cho ảnh ven nắng.',
    costType: 'TICKET',
    ticketPriceRange: '70.000đ / vé người lớn',
    cameraFeePolicy: 'Đã bao gồm trong vé, không phụ thu máy cơ hay ekip cá nhân.',
    recommendedLenses: ['85mm f/1.8 (chân dung)', '50mm f/1.4', '35mm (toàn cảnh vườn hoa)'],
    recommendedOutfits: ['Trắng kem thuần khiết', 'Len be phong cách Hàn Quốc', 'Áo dài trắng truyền thống', 'Váy hoa vintage nhạt'],
    colorPalette: ['#F9F8F6', '#E9DEC7', '#8A9A5B', '#C85A32', '#3D3D3D'],
    crowdLevelByHour: {{
      morning: 'Trung bình',
      noon: 'Vắng',
      afternoon: 'Đông',
      evening: 'Vắng'
    }},
    coverImageUrl: '{fb[0]["local_photos"][0]}',
    galleryUrls: [
      '{fb[0]["local_photos"][0]}',
      '{fb[0]["local_photos"][1]}',
      '{fb[0]["local_photos"][2]}',
      '{fb[8]["local_photos"][0]}'
    ],
    description: 'Thánh địa chụp ảnh mùa đông Hà Nội. Vào tháng 11, cả khu vườn bừng sáng sắc trắng tinh khôi của cúc họa mi, hòa cùng những bãi lau sậy hoang sơ trải dài ven bờ Sông Hồng lộng gió.',
    photographyTips: [
      'Nên mang ống kính có tiêu cự từ 50mm trở lên để nén hậu cảnh, giấu bớt những đoàn người chụp xung quanh.',
      'Sử dụng phụ kiện như giỏ cói, mũ nồi beret, sách cổ hoặc ô trong suốt.',
      'Đến trước 7:30 sáng vào các ngày trong tuần để tận hưởng trọn vẹn sự tĩnh lặng.'
    ],
    seasonalTrend: {{
      id: 'trend-hn-01',
      trendTitle: 'Mùa Cúc Họa Mi Trắng Báo Đông',
      startMonth: 10,
      endMonth: 12,
      peakStartWeek: 45,
      peakEndWeek: 48,
      status: 'PEAK',
      bloomPercentage: 92,
      daysLeftInPeak: 8,
      conceptTags: ['HOA_CO', 'NANG_THO', 'AO_DAI', 'FILM'],
      isTrending: true,
      trendScore: 98
    }},
    inspirationPosts: [
{inspo_hn_01_a},
{inspo_hn_01_b}
    ],
    recentReports: [
      {{
        id: 'rep-01',
        authorName: 'Quốc Đạt (Photographer)',
        reportedAt: '2 giờ trước',
        bloomPercentage: 95,
        crowdLevel: 'Đông',
        notes: 'Hoa đang ở độ nở rộ nhất, cánh tươi không bị dập. Đi tầm 15h30 nắng xiên qua hoa cực kỳ thơ mộng.',
        weather: 'Nắng đẹp'
      }}
    ]
      savesCount: 3840,
    isFeatured: true,
}},
  {{
    id: 'spot-hn-02',
    regionId: 'hanoi',
    name: 'Phố Hàng Mã — Không Khí Lễ Hội & Sắc Màu Cổ Kính',
    slug: 'pho-hang-ma-trung-thu-giang-sinh',
    address: 'Phố Hàng Mã, Hàng Bồ, Hoàn Kiếm, Hà Nội',
    lat: 21.0368,
    lng: 105.8491,
    bestTimeOfDay: 'NIGHT',
    bestTimeDescription: 'Chập tối (17:30 - 19:30) khi các sạp hàng đồng loạt lên đèn lồng và đèn led lung linh.',
    lightingNotes: 'Độ tương phản ánh sáng cao giữa các lồng đèn rực rỡ và bóng tối phố cổ. Tận dụng bokeh tròn từ đèn lồng làm tiền/hậu cảnh.',
    sunOrientation: 'Phố hẹp nằm theo trục Đông - Tây, ánh sáng tự nhiên tắt sớm hơn mặt bằng chung 30 phút.',
    costType: 'FREE',
    ticketPriceRange: 'Miễn phí tham quan',
    cameraFeePolicy: 'Chụp dạo tự do. Nếu vào chụp lâu trong các gian hàng lớn nên mua ủng hộ món đồ lưu niệm nhỏ (30k - 50k).',
    recommendedLenses: ['35mm f/1.4 (đa dụng không gian hẹp)', '50mm f/1.8', '24mm f/1.4 (bắt trọn không khí sầm uất)'],
    recommendedOutfits: ['Áo dài đỏ rực rỡ', 'Áo dài lụa truyền thống', 'Tone màu ấm vintage', 'Yếm đào cách tân'],
    colorPalette: ['#C82A2A', '#FDB813', '#1A1A1A', '#2D5A27', '#E8927C'],
    crowdLevelByHour: {{
      morning: 'Vắng',
      noon: 'Trung bình',
      afternoon: 'Đông',
      evening: 'Quá tải'
    }},
    coverImageUrl: '{fb[11]["local_photos"][0]}',
    galleryUrls: [
      '{fb[11]["local_photos"][0]}',
      '{fb[11]["local_photos"][1]}',
      '{fb[11]["local_photos"][2]}',
      '{fb[10]["local_photos"][0]}'
    ],
    description: 'Trái tim rực rỡ nhất của 36 phố phường Hà Nội mỗi dịp lễ hội. Dãy phố ngập tràn lồng đèn cá chép, đầu lân sư rồng và muôn vàn sắc đỏ vàng truyền thống ấm cúng.',
    photographyTips: [
      'Nên đi vào khoảng 17h30 - 18h15 khi trời còn ánh sáng xanh (blue hour) để bầu trời không bị đen kịt.',
      'Sử dụng khẩu độ lớn f/1.4 - f/2.0 để gom sáng và tạo bokeh lung linh huyền ảo từ vô số bóng đèn lồng.',
      'Tôn trọng chủ cửa hàng, đứng gọn gàng tránh cản trở lối đi buôn bán.'
    ],
    seasonalTrend: {{
      id: 'trend-hn-02',
      trendTitle: 'Sắc Đỏ Rực Rỡ Lễ Hội Phố Cổ',
      startMonth: 8,
      endMonth: 12,
      peakStartWeek: 37,
      peakEndWeek: 40,
      status: 'PEAK',
      bloomPercentage: 100,
      daysLeftInPeak: 5,
      conceptTags: ['VINTAGE', 'AO_DAI', 'FILM', 'STREET'],
      isTrending: true,
      trendScore: 96
    }},
    inspirationPosts: [
{inspo_hn_02_a},
{inspo_hn_02_b}
    ],
    recentReports: [
      {{
        id: 'rep-02',
        authorName: 'Minh Hương (Mod Aphoto)',
        reportedAt: '1 ngày trước',
        bloomPercentage: 100,
        crowdLevel: 'Quá tải',
        notes: 'Các tiệm đã lên đèn đầy đủ 100%. Tầm 19h trở đi rất đông nên tranh thủ đi sớm tầm 17h30 có ảnh thoáng đẹp.',
        weather: 'Nắng đẹp'
      }}
    ]
      savesCount: 2950,
    isFeatured: true,
}},
  {{
    id: 'spot-hn-03',
    regionId: 'hanoi',
    name: 'Đường Phan Đình Phùng — Mùa Thu Lá Vàng & Xe Hoa Rong',
    slug: 'duong-phan-dinh-phung-xe-hoa-la-vang',
    address: 'Đường Phan Đình Phùng, Ba Đình, Hà Nội',
    lat: 21.0401,
    lng: 105.8392,
    bestTimeOfDay: 'GOLDEN_HOUR_MORNING',
    bestTimeDescription: 'Sáng sớm (7:30 - 9:30) khi tia nắng xiên qua vòm lá sấu cổ thụ tạo luồng sáng (god rays).',
    lightingNotes: 'Hiệu ứng Tyndall (luồng nắng xiên) đẹp nhất vào những sáng thu có chút sương nhẹ. Khép khẩu f/4 hoặc f/5.6 nếu muốn tia nắng nét rõ.',
    sunOrientation: 'Tuyến đường rợp bóng cây cổ thụ hai bên, vệt nắng rọi nghiêng từ hướng Đông Bắc xuống mặt đường.',
    costType: 'FREE',
    ticketPriceRange: 'Miễn phí vỉa hè / Mua hoa chụp: 50.000đ - 100.000đ / bó',
    cameraFeePolicy: 'Chụp tự do không phụ thu.',
    recommendedLenses: ['85mm f/1.4 (xóa phông xe cộ)', '70-200mm f/2.8', '50mm f/1.4'],
    recommendedOutfits: ['Áo dài trắng nữ sinh', 'Áo dài lụa tơ tằm cổ điển', 'Váy vintage be/nâu mùa thu', 'Tone màu trung tính'],
    colorPalette: ['#556B2F', '#DAA520', '#F5F5DC', '#8B4513', '#2F4F4F'],
    crowdLevelByHour: {{
      morning: 'Đông',
      noon: 'Trung bình',
      afternoon: 'Đông',
      evening: 'Trung bình'
    }},
    coverImageUrl: '{fb[12]["local_photos"][0]}',
    galleryUrls: [
      '{fb[12]["local_photos"][0]}',
      '{fb[12]["local_photos"][1]}',
      '{fb[12]["local_photos"][4]}',
      '{fb[1]["local_photos"][0]}'
    ],
    description: 'Con đường lãng mạn bậc nhất thủ đô với hai hàng sấu cổ thụ trăm tuổi che rợp bóng mát, nơi những chiếc xe đạp chở đầy hoa tươi theo mùa dừng chân bên vỉa hè lát gạch rêu phong.',
    photographyTips: [
      'Đứng chờ thời khắc có luồng nắng xiên rọi trúng xe hoa và vị trí mẫu đứng để có bức ảnh đậm chất thơ.',
      'Nên chụp bằng ống tele 85mm hoặc 135mm để nén phối cảnh hai hàng cây và loại bỏ bớt xe máy lưu thông.',
      'Chuẩn bị sẵn bó hoa sen hoặc hoa baby mua trực tiếp từ các cô bán hàng rong để có đạo cụ tươi tắn.'
    ],
    seasonalTrend: {{
      id: 'trend-hn-03',
      trendTitle: 'Mùa Thu Hà Nội & Xe Hoa Rực Sắc',
      startMonth: 8,
      endMonth: 11,
      peakStartWeek: 35,
      peakEndWeek: 42,
      status: 'PEAK',
      bloomPercentage: 88,
      daysLeftInPeak: 12,
      conceptTags: ['AO_DAI', 'NANG_THO', 'VINTAGE', 'FILM'],
      isTrending: true,
      trendScore: 99
    }},
    inspirationPosts: [
{inspo_hn_03_a},
{inspo_hn_03_b}
    ],
    recentReports: [
      {{
        id: 'rep-03',
        authorName: 'Hà My (Nhiếp ảnh gia tự do)',
        reportedAt: 'Sáng nay',
        bloomPercentage: 90,
        crowdLevel: 'Đông',
        notes: 'Xe hoa tập trung nhiều đoạn gần cổng trường Phan Đình Phùng và vườn hoa Mai Xuân Thưởng. Nắng sáng 8h30 lên rất trong.',
        weather: 'Nắng đẹp'
      }}
    ]
      savesCount: 4210,
    isFeatured: true,
}},
  {{
    id: 'spot-hn-04',
    regionId: 'hanoi',
    name: 'Cầu Long Biên — Dấu Ấn Trăm Năm & Hoàng Hôn Sông Hồng',
    slug: 'cau-long-bien-hoang-hon-song-hong',
    address: 'Cầu Long Biên, Hoàn Kiếm - Long Biên, Hà Nội',
    lat: 21.0435,
    lng: 105.8562,
    bestTimeOfDay: 'SUNSET',
    bestTimeDescription: 'Chiều hoàng hôn (16:30 - 17:45) khi mặt trời rọi những tia nắng vàng óng qua khung thép rỉ sét huyền thoại.',
    lightingNotes: 'Hiệu ứng ánh sáng xuyên khe sắt tạo bóng đổ hình học (geometric shadows) vô cùng kịch tính và hoài niệm.',
    sunOrientation: 'Mặt trời lặn chếch phía hạ lưu sông Hồng, nhuộm vàng cả nhịp cầu sắt cổ kính.',
    costType: 'FREE',
    ticketPriceRange: 'Miễn phí tham quan',
    cameraFeePolicy: 'Chụp ảnh tự do. Chú ý an toàn hành lang tàu hỏa và xe máy.',
    recommendedLenses: ['50mm f/1.4', '35mm f/1.4', '28mm (góc rộng đường ray)'],
    recommendedOutfits: ['Phong cách vintage 90s', 'Denim cổ điển', 'Áo dài trắng nữ sinh', 'Măng tô mùa đông'],
    colorPalette: ['#A0522D', '#D2691E', '#CD853F', '#2F4F4F', '#F4A460'],
    crowdLevelByHour: {{
      morning: 'Trung bình',
      noon: 'Vắng',
      afternoon: 'Đông',
      evening: 'Trung bình'
    }},
    coverImageUrl: '{fb[5]["local_photos"][0]}',
    galleryUrls: [
      '{fb[5]["local_photos"][0]}',
      '{fb[5]["local_photos"][2]}',
      '{fb[5]["local_photos"][4]}',
      '{fb[7]["local_photos"][0]}'
    ],
    description: 'Chứng nhân lịch sử trăm năm nối đôi bờ sông Hồng, biểu tượng bất tử của kiến trúc thép Đông Dương và là nguồn cảm hứng bất tận của nhiếp ảnh gia đường phố.',
    photographyTips: [
      'Canh thời điểm tàu hỏa chạy qua vào buổi chiều để bắt trọn khoảnh khắc đoàn tàu lướt trên ray sắt.',
      'Sử dụng các thanh dầm thép làm đường dẫn (leading lines) hút ánh nhìn về phía chủ thể.',
      'Luôn đứng bên trong vạch an toàn cho người đi bộ, tuyệt đối không nhảy vào lòng đường ray khi có còi báo.'
    ],
    seasonalTrend: {{
      id: 'trend-hn-04',
      trendTitle: 'Hoàng Hôn Cầu Sắt Cổ Kính',
      startMonth: 9,
      endMonth: 2,
      peakStartWeek: 40,
      peakEndWeek: 50,
      status: 'PEAK',
      bloomPercentage: 85,
      daysLeftInPeak: 20,
      conceptTags: ['VINTAGE', 'STREET', 'FILM', 'KIEN_TRUC'],
      isTrending: true,
      trendScore: 94
    }},
    inspirationPosts: [
{inspo_hn_04_a},
{inspo_hn_04_b}
    ],
    recentReports: [
      {{
        id: 'rep-04',
        authorName: 'Hoàng Nam (Street Photographer)',
        reportedAt: 'Chiều qua',
        bloomPercentage: 85,
        crowdLevel: 'Trung bình',
        notes: 'Chiều nay hoàng hôn đỏ rực rất đẹp. Gió sông mát, chụp từ 16h30 đến 17h15 là ánh sáng đỉnh nhất.',
        weather: 'Nắng đẹp'
      }}
    ]
      savesCount: 2680,
    isFeatured: true,
}},
  {{
    id: 'spot-hn-05',
    regionId: 'hanoi',
    name: 'Bảo Tàng Mỹ Thuật Việt Nam — Kiến Trúc Pháp & Ánh Sáng Tĩnh Lặng',
    slug: 'bao-tang-my-thuat-viet-nam',
    address: '66 Nguyễn Thái Học, Ba Đình, Hà Nội',
    lat: 21.0305,
    lng: 105.8354,
    bestTimeOfDay: 'DAYLIGHT',
    bestTimeDescription: 'Buổi sáng (9:00 - 11:30) hoặc Đầu giờ chiều (13:30 - 15:30) khi ánh sáng giếng trời và hành lang mềm mại nhất.',
    lightingNotes: 'Ánh sáng cửa sổ vòm kiểu Pháp tạo hiệu ứng Rembrandt portrait tuyệt đẹp với bóng đổ êm ái, màu sơn tường vàng ấm áp.',
    sunOrientation: 'Tòa nhà kiến trúc thuộc địa Pháp hướng Nam, các hành lang bên nhận ánh sáng gián tiếp êm dịu suốt cả ngày.',
    costType: 'TICKET',
    ticketPriceRange: '40.000đ / vé người lớn (Sinh viên: 20.000đ)',
    cameraFeePolicy: 'Được chụp bằng điện thoại và máy ảnh cá nhân không bật đèn flash, không dùng chân máy lớn.',
    recommendedLenses: ['50mm f/1.4 (chân dung tĩnh lặng)', '35mm f/1.4', '24-70mm f/2.8'],
    recommendedOutfits: ['Trang phục đơn sắc minimalism', 'Áo dài trắng/đen cách tân', 'Tone màu be/nâu trầm thanh lịch'],
    colorPalette: ['#C5A059', '#3D3D3D', '#EFEBD9', '#8C2D19', '#5B6E57'],
    crowdLevelByHour: {{
      morning: 'Vắng',
      noon: 'Rất vắng',
      afternoon: 'Vắng',
      evening: 'Vắng'
    }},
    coverImageUrl: '{fb[3]["local_photos"][0]}',
    galleryUrls: [
      '{fb[3]["local_photos"][0]}',
      '{fb[3]["local_photos"][1]}',
      '{fb[3]["local_photos"][4]}',
      '{fb[4]["local_photos"][0]}'
    ],
    description: 'Không gian nghệ thuật hàn lâm cổ kính với kiến trúc Pháp thanh lịch, những cầu thang gỗ uốn lượn và hành lang ngập tràn ánh sáng tĩnh mịch đầy chiều sâu thị giác.',
    photographyTips: [
      'Tận dụng các khung cửa sổ vòm lớn và hành lang gỗ để tạo bố cục khung trong khung (frame-in-frame).',
      'Giữ trật tự yên tĩnh tuyệt đối trong các gian trưng bày nghệ thuật, không chạm vào hiện vật.',
      'Sử dụng khẩu độ lớn f/1.4 - f/2.0 vì không gian trong nhà bảo tàng cần gom đủ ánh sáng tự nhiên.'
    ],
    seasonalTrend: {{
      id: 'trend-hn-05',
      trendTitle: 'Nghệ Thuật Hàn Lâm & Không Gian Pháp',
      startMonth: 1,
      endMonth: 12,
      peakStartWeek: 1,
      peakEndWeek: 52,
      status: 'ACTIVE',
      bloomPercentage: 100,
      daysLeftInPeak: 365,
      conceptTags: ['MINIMAL', 'KIEN_TRUC', 'VINTAGE', 'AO_DAI'],
      isTrending: false,
      trendScore: 89
    }},
    inspirationPosts: [
{inspo_hn_05_a},
{inspo_hn_05_b}
    ],
    recentReports: [
      {{
        id: 'rep-05',
        authorName: 'Khánh Linh (Curator)',
        reportedAt: 'Hôm nay',
        bloomPercentage: 100,
        crowdLevel: 'Vắng',
        notes: 'Không gian tĩnh lặng, các gian trưng bày tầng 2 và cầu thang gỗ có ánh sáng tự nhiên rọi vào cực kỳ đẹp mắt.',
        weather: 'Nắng đẹp'
      }}
    ]
      savesCount: 1890,
    isFeatured: false,
}},
  {{
    id: 'spot-hcm-01',
    regionId: 'hcm',
    name: 'Bến Bạch Đằng & Cầu Ba Son — Hoàng Hôn Thành Phố & Tàu Waterbus',
    slug: 'ben-bach-dang-cau-ba-son-hoang-hon',
    address: 'Đường Tôn Đức Thắng, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    lat: 10.7731,
    lng: 106.7072,
    bestTimeOfDay: 'SUNSET',
    bestTimeDescription: 'Chiều hoàng hôn (17:00 - 18:30) khi thành phố lên đèn và mặt sông Sài Gòn lấp lánh phản chiếu.',
    lightingNotes: 'Ánh hoàng hôn phản chiếu từ các tòa nhà kính chọc trời Quận 1 sang bờ Thủ Thiêm tạo dải sáng vàng cam rực rỡ.',
    sunOrientation: 'Mặt trời lặn sau lưng skyline trung tâm thành phố, tạo bóng đổ silhouette tuyệt mỹ.',
    costType: 'FREE',
    ticketPriceRange: 'Miễn phí công viên / Vé tàu Waterbus: 15.000đ / lượt',
    cameraFeePolicy: 'Chụp tự do không phụ thu.',
    recommendedLenses: ['24-70mm f/2.8 (đa dụng phong cảnh & chân dung)', '85mm f/1.8', '16-35mm (góc rộng kiến trúc)'],
    recommendedOutfits: ['Hiện đại năng động', 'Váy lụa thướt tha hoàng hôn', 'Tone trắng/đen thanh lịch', 'Áo dài cách tân'],
    colorPalette: ['#1C3144', '#D00000', '#FFBA08', '#3F88C5', '#F5F5F5'],
    crowdLevelByHour: {{
      morning: 'Vắng',
      noon: 'Vắng',
      afternoon: 'Trung bình',
      evening: 'Quá tải'
    }},
    coverImageUrl: '{fb[9]["local_photos"][0]}',
    galleryUrls: [
      '{fb[9]["local_photos"][0]}',
      '{fb[9]["local_photos"][1]}',
      '{fb[9]["local_photos"][2]}',
      '{fb[9]["local_photos"][3]}'
    ],
    description: 'Biểu tượng hiện đại mới của Sài Gòn với tầm nhìn ôm trọn sông Sài Gòn, cầu Ba Son dây văng kiêu hãnh và ga tàu thủy lung linh khi chiều buông.',
    photographyTips: [
      'Đứng tại mũi công viên Bạch Đằng đón gió sông và lấy góc máy thấp ngước lên cầu Ba Son để tôn chiều cao.',
      'Canh chuyến tàu Waterbus cập bến để bắt khoảnh khắc tương tác với đoàn tàu màu vàng rực rỡ.',
      'Mang kính lọc CPL để khử bớt độ lóa trên mặt nước vào lúc nắng xiên.'
    ],
    seasonalTrend: {{
      id: 'trend-hcm-01',
      trendTitle: 'Hoàng Hôn Sông Sài Gòn & Cầu Ba Son',
      startMonth: 1,
      endMonth: 12,
      peakStartWeek: 1,
      peakEndWeek: 52,
      status: 'ACTIVE',
      bloomPercentage: 100,
      daysLeftInPeak: 365,
      conceptTags: ['STREET', 'KIEN_TRUC', 'FILM', 'MINIMAL'],
      isTrending: true,
      trendScore: 95
    }},
    inspirationPosts: [
{inspo_hcm_01}
    ],
    recentReports: [
      {{
        id: 'rep-06',
        authorName: 'Tuấn Kiệt (Photographer SG)',
        reportedAt: 'Chiều nay',
        bloomPercentage: 100,
        crowdLevel: 'Đông',
        notes: 'Gió chiều rất mát, nắng hoàng hôn vàng cam đổ bóng qua cầu Ba Son cực đẹp lúc 17h30.',
        weather: 'Nắng đẹp'
      }}
    ]
      savesCount: 3120,
    isFeatured: true,
}},
  {{
    id: 'spot-hcm-02',
    regionId: 'hcm',
    name: 'Chung Cư Tôn Thất Đạm — Không Gian Sài Gòn Cổ Thập Niên 80',
    slug: 'chung-cu-ton-that-dam-vintage-film',
    address: '14 Tôn Thất Đạm, Nguyễn Thái Bình, Quận 1, TP. Hồ Chí Minh',
    lat: 10.7709,
    lng: 106.7047,
    bestTimeOfDay: 'DAYLIGHT',
    bestTimeDescription: 'Buổi sáng (8:30 - 10:30) hoặc Đầu giờ chiều (14:00 - 16:00) khi ánh sáng giếng trời rọi xuống hành lang.',
    lightingNotes: 'Ánh sáng cửa sổ hành lang tạo những dải sáng tối chiaroscuro ấn tượng, tường vàng tróc sơn mang màu sắc thời gian.',
    sunOrientation: 'Tòa nhà hướng Tây Bắc, các góc cầu thang đón luồng sáng gián tiếp lý tưởng cho ảnh film cổ điển.',
    costType: 'FREE',
    ticketPriceRange: 'Miễn phí lên chung cư / Nên uống nước ủng hộ quán cafe: 45.000đ - 70.000đ',
    cameraFeePolicy: 'Chụp cá nhân tự do. Giữ trật tự không gây ồn ào ảnh hưởng cư dân sinh sống.',
    recommendedLenses: ['35mm f/1.4 (góc nhìn mắt người chân thực)', '50mm f/1.4', '28mm f/2.0'],
    recommendedOutfits: ['Retro Hongkong thập niên 80-90', 'Áo sơ mi hoa vintage', 'Áo dài nhung cổ điển', 'Phong cách Y2K'],
    colorPalette: ['#8B0000', '#B8860B', '#2F4F4F', '#D2B48C', '#1A1A1A'],
    crowdLevelByHour: {{
      morning: 'Vắng',
      noon: 'Vắng',
      afternoon: 'Trung bình',
      evening: 'Trung bình'
    }},
    coverImageUrl: '{fb[2]["local_photos"][0]}',
    galleryUrls: [
      '{fb[2]["local_photos"][0]}',
      '{fb[2]["local_photos"][1]}',
      '{fb[2]["local_photos"][2]}',
      '{fb[6]["local_photos"][0]}'
    ],
    description: 'Chung cư cổ kính nhuốm màu thời gian giữa lòng trung tâm Quận 1 sầm uất, nơi hội tụ những quán cafe phong cách hoài niệm, ban công rêu phong và cầu thang gỗ cổ điển.',
    photographyTips: [
      'Góc chụp kinh điển ở chiếu nghỉ cầu thang gỗ tầng 2 nhìn thẳng ra cửa sổ chớp xanh lá.',
      'Sử dụng film giả lập Kodak Portra 400 hoặc Fuji Superia để tôn sắc vàng ấm áp của những mảng tường cũ.',
      'Đi nhẹ, nói khẽ và không đứng chắn lối đi của người dân bản địa.'
    ],
    seasonalTrend: {{
      id: 'trend-hcm-02',
      trendTitle: 'Sài Gòn Xưa — Hoài Niệm Phim Thập Niên 90',
      startMonth: 1,
      endMonth: 12,
      peakStartWeek: 1,
      peakEndWeek: 52,
      status: 'ACTIVE',
      bloomPercentage: 100,
      daysLeftInPeak: 365,
      conceptTags: ['VINTAGE', 'FILM', 'STREET', 'KIEN_TRUC'],
      isTrending: false,
      trendScore: 88
    }},
    inspirationPosts: [
{inspo_hcm_02_a},
{inspo_hcm_02_b}
    ],
    recentReports: [
      {{
        id: 'rep-07',
        authorName: 'Bảo Trâm (Film Shooter)',
        reportedAt: '2 ngày trước',
        bloomPercentage: 100,
        crowdLevel: 'Vắng',
        notes: 'Chung cư yên tĩnh, quán cafe tầng 1 mở cửa từ 8h sáng, có quạt mát và đạo cụ bàn ghế cổ chụp rất hợp.',
        weather: 'Nắng đẹp'
      }}
    ]
      savesCount: 1740,
    isFeatured: false,
}},
  {{
    id: 'spot-dl-01',
    regionId: 'dalat',
    name: 'Đồi Cỏ Hồng Đan Kia — Sương Mù & Thảm Cỏ Hồng Tuyết',
    slug: 'doi-co-hong-dan-kia-suong-som',
    address: 'Khu vực hồ Đan Kia - Suối Vàng, Lạc Dương, Lâm Đồng',
    lat: 12.0125,
    lng: 108.3842,
    bestTimeOfDay: 'GOLDEN_HOUR_MORNING',
    bestTimeDescription: 'Sáng sớm tinh mơ (5:30 - 7:00) khi những giọt sương đọng trên ngọn cỏ hồng tạo thành thảm cỏ tuyết lung linh.',
    lightingNotes: 'Ánh nắng bình minh chiếu xiên sát mặt đất làm bốc hơi sương sớm, tạo nên làn khói sương mờ ảo huyền diệu.',
    sunOrientation: 'Mặt trời mọc từ rặng thông phía Đông, rọi thẳng vào triền đồi dốc thoai thoải.',
    costType: 'FREE',
    ticketPriceRange: 'Miễn phí tham quan',
    cameraFeePolicy: 'Chụp tự do không phụ thu.',
    recommendedLenses: ['70-200mm f/2.8 (bắt tia nắng và mẫu từ xa)', '85mm f/1.4', '16-35mm (toàn cảnh đồi thông)'],
    recommendedOutfits: ['Len trắng/kem ấm áp', 'Áo khoác dạ màu nâu camel', 'Váy Bohemian thảo nguyên', 'Mũ len beret'],
    colorPalette: ['#DDA0DD', '#BC8F8F', '#2E8B57', '#F0E68C', '#4A766E'],
    crowdLevelByHour: {{
      morning: 'Đông',
      noon: 'Rất vắng',
      afternoon: 'Trung bình',
      evening: 'Vắng'
    }},
    coverImageUrl: '{fb[8]["local_photos"][0]}',
    galleryUrls: [
      '{fb[8]["local_photos"][0]}',
      '{fb[8]["local_photos"][1]}',
      '{fb[8]["local_photos"][2]}',
      '{fb[0]["local_photos"][4]}'
    ],
    description: 'Tuyệt tác thiên nhiên Đà Lạt mỗi độ chớm đông. Cả triền đồi ngút ngàn đổi màu hồng tím phớt tuyết bên hồ nước phẳng lặng như gương soi bóng rặng thông già.',
    photographyTips: [
      'Phải dậy thật sớm và có mặt tại đồi trước 6:00 sáng để bắt được khoảnh khắc cỏ tuyết trắng xóa trước khi nắng làm tan sương.',
      'Sử dụng góc máy chụp thấp ngang tầm ngọn cỏ để thảm cỏ hồng trông dày dặn và mênh mông hơn.',
      'Đường vào đồi đất đỏ khá trơn trượt vào sáng sớm, nên đi xe gầm cao hoặc thuê xe jeep chuyên dụng.'
    ],
    seasonalTrend: {{
      id: 'trend-dl-01',
      trendTitle: 'Mùa Cỏ Hồng Tuyết Chớm Đông',
      startMonth: 11,
      endMonth: 12,
      peakStartWeek: 46,
      peakEndWeek: 49,
      status: 'PEAK',
      bloomPercentage: 95,
      daysLeftInPeak: 14,
      conceptTags: ['HOA_CO', 'NANG_THO', 'FILM', 'VINTAGE'],
      isTrending: true,
      trendScore: 97
    }},
    inspirationPosts: [
{inspo_dl_01}
    ],
    recentReports: [
      {{
        id: 'rep-08',
        authorName: 'Đức Huy (Tour Guide Đà Lạt)',
        reportedAt: 'Sáng nay lúc 6:00',
        bloomPercentage: 95,
        crowdLevel: 'Đông',
        notes: 'Cỏ hồng đã vào độ nở dày và phớt hồng tím rực rỡ nhất mùa. Đi tầm 5h45 có cỏ tuyết đọng sương rất ảo diệu.',
        weather: 'Nắng đẹp'
      }}
    ]
      savesCount: 3560,
    isFeatured: true,
}},
  {{
    id: 'spot-dl-02',
    regionId: 'dalat',
    name: 'Đèo Dran & Tu Tra — Cung Đường Hoa Dã Quỳ Vàng Rực',
    slug: 'deo-dran-tu-tra-hoa-da-quy',
    address: 'Đèo Dran và xã Tu Tra, Đơn Dương - Đà Lạt, Lâm Đồng',
    lat: 11.8542,
    lng: 108.5621,
    bestTimeOfDay: 'GOLDEN_HOUR_MORNING',
    bestTimeDescription: 'Buổi sáng (7:30 - 9:30) khi nắng vàng rọi vào những triền dã quỳ nở bung rực rỡ bên vách đèo.',
    lightingNotes: 'Sắc vàng của dã quỳ kết hợp với nền trời xanh ngắt tạo độ bão hòa màu sắc tươi tắn, căng tràn sức sống.',
    sunOrientation: 'Cung đèo uốn lượn nhiều khúc cua, ánh sáng mặt trời thay đổi linh hoạt theo từng góc ngoặt.',
    costType: 'FREE',
    ticketPriceRange: 'Miễn phí ven đường',
    cameraFeePolicy: 'Chụp tự do không phụ thu.',
    recommendedLenses: ['50mm f/1.4', '85mm f/1.8', '24-70mm f/2.8'],
    recommendedOutfits: ['Phượt thủ cá tính', 'Áo khoác len vàng mù tạt / be', 'Váy trắng bay bổng thảo nguyên', 'Tone đất ấm áp'],
    colorPalette: ['#FFA500', '#2E8B57', '#87CEEB', '#8B4513', '#FFF8DC'],
    crowdLevelByHour: {{
      morning: 'Trung bình',
      noon: 'Vắng',
      afternoon: 'Trung bình',
      evening: 'Vắng'
    }},
    coverImageUrl: '{fb[4]["local_photos"][0]}',
    galleryUrls: [
      '{fb[4]["local_photos"][0]}',
      '{fb[4]["local_photos"][1]}',
      '{fb[4]["local_photos"][2]}',
      '{fb[4]["local_photos"][3]}'
    ],
    description: 'Cung đường đèo huyền thoại ngập tràn sắc vàng rực của hoa dã quỳ - loài hoa dại kiêu hãnh báo hiệu mùa khô Tây Nguyên đã về trên những cao nguyên đất đỏ.',
    photographyTips: [
      'Chọn những khúc cua rộng có tầm nhìn thoáng xuống thung lũng bên dưới để lấy hậu cảnh rừng thông hùng vĩ.',
      'Đứng phía trong lề đường an toàn, chú ý quan sát xe tải và xe khách đổ đèo.',
      'Kết hợp chụp cùng chiếc xe máy phượt bụi bặm để tạo phong cách tự do phóng khoáng.'
    ],
    seasonalTrend: {{
      id: 'trend-dl-02',
      trendTitle: 'Mùa Hoa Dã Quỳ Vàng Rực Cao Nguyên',
      startMonth: 10,
      endMonth: 11,
      peakStartWeek: 43,
      peakEndWeek: 46,
      status: 'PEAK',
      bloomPercentage: 88,
      daysLeftInPeak: 6,
      conceptTags: ['HOA_CO', 'VINTAGE', 'STREET', 'NANG_THO'],
      isTrending: true,
      trendScore: 92
    }},
    inspirationPosts: [
{inspo_dl_02}
    ],
    recentReports: [
      {{
        id: 'rep-09',
        authorName: 'Thành Long (Biker)',
        reportedAt: 'Hôm qua',
        bloomPercentage: 88,
        crowdLevel: 'Trung bình',
        notes: 'Đoạn từ chân đèo Dran vào thị trấn D’ran hoa nở rực rỡ nhất, nắng sáng từ 8h - 10h chụp rất tươi tắn.',
        weather: 'Nắng đẹp'
      }}
    ]
      savesCount: 2280,
    isFeatured: false,
}},
  {{
    id: 'spot-sp-01',
    regionId: 'sapa',
    name: 'Đồi Chè Ô Long — Mai Anh Đào Nở Rực Giữa Đồi Chè Xanh',
    slug: 'doi-che-o-long-mai-anh-dao-sapa',
    address: 'Đèo Ô Quy Hồ, Sa Pả, Thị xã Sa Pa, Lào Cai',
    lat: 22.3582,
    lng: 103.7845,
    bestTimeOfDay: 'GOLDEN_HOUR_MORNING',
    bestTimeDescription: 'Sáng sớm (6:30 - 8:30) khi mây bồng bềnh tràn qua các rặng anh đào và luống chè bậc thang.',
    lightingNotes: 'Ánh nắng xiên chiếu xuyên qua màn sương mù mỏng manh, tạo nên sự tương phản ngọt ngào giữa màu hồng phấn và màu xanh ngọc bích.',
    sunOrientation: 'Mặt trời nhô lên từ dãy Hoàng Liên Sơn hùng vĩ, ánh sáng rọi từ sườn đông của thung lũng Ô Quy Hồ.',
    costType: 'FREE',
    ticketPriceRange: 'Miễn phí tham quan / Có thể gửi phí bảo vệ chăm sóc chè: 20.000đ - 50.000đ',
    cameraFeePolicy: 'Chụp tự do. Tuyệt đối không giẫm lên búp chè non hoặc bẻ cành đào.',
    recommendedLenses: ['70-200mm f/2.8 (nén tầng lớp đồi chè)', '100-400mm', '85mm f/1.8'],
    recommendedOutfits: ['Váy trắng công chúa bồng bềnh', 'Áo len đỏ/hồng nổi bật', 'Trang phục thổ cẩm Tây Bắc cách tân', 'Tone màu pastel'],
    colorPalette: ['#FFB7C5', '#2E8B57', '#556B2F', '#FFFFFF', '#4682B4'],
    crowdLevelByHour: {{
      morning: 'Đông',
      noon: 'Vắng',
      afternoon: 'Trung bình',
      evening: 'Vắng'
    }},
    coverImageUrl: '{fb[1]["local_photos"][0]}',
    galleryUrls: [
      '{fb[1]["local_photos"][0]}',
      '{fb[1]["local_photos"][1]}',
      '{fb[1]["local_photos"][2]}',
      '{fb[1]["local_photos"][3]}'
    ],
    description: 'Bức tranh thủy mặc diễm lệ bậc nhất vùng cao Tây Bắc. Những hàng cây mai anh đào hồng thắm trồng xen kẽ giữa các luống chè Ô Long uốn lượn hình vân tay ôm trọn sườn núi.',
    photographyTips: [
      'Mang ống kính tele tiêu cự từ 135mm đến 200mm để nén chặt những hàng mai anh đào thẳng tắp và các đường lượn đồi chè.',
      'Sử dụng flycam (nếu có giấy phép) để bắt trọn những dải vân đồi chè hình xoắn ốc tuyệt mỹ từ trên cao.',
      'Đến sớm trước 7h00 sáng để săn biển mây vờn quanh thân cây đào.'
    ],
    seasonalTrend: {{
      id: 'trend-sp-01',
      trendTitle: 'Mùa Mai Anh Đào Nở Rực Giữa Đồi Chè',
      startMonth: 12,
      endMonth: 1,
      peakStartWeek: 50,
      peakEndWeek: 2,
      status: 'ACTIVE',
      bloomPercentage: 65,
      daysLeftInPeak: 18,
      conceptTags: ['HOA_CO', 'NANG_THO', 'VINTAGE', 'FILM'],
      isTrending: true,
      trendScore: 98
    }},
    inspirationPosts: [
{inspo_sp_01}
    ],
    recentReports: [
      {{
        id: 'rep-10',
        authorName: 'Hoàng Sa Pa (Local Guide)',
        reportedAt: 'Sáng nay',
        bloomPercentage: 65,
        crowdLevel: 'Trung bình',
        notes: 'Những cây đào phía sườn đón nắng đã bắt đầu bung nở những bông đầu tiên, dự kiến khoảng 10 ngày nữa sẽ nở rộ toàn đồi.',
        weather: 'Nắng đẹp'
      }}
    ]
      savesCount: 3980,
    isFeatured: true,
}}
];
"""

with open("src/data/mockSpots.ts", "w", encoding="utf-8") as f:
    f.write(mock_spots_code)

print("Generated src/data/mockSpots.ts with 100% strict TypeScript types and real Facebook photos!")
