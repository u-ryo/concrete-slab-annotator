@GrabConfig(systemClassLoader=true)
// @Grab('mysql:mysql-connector-java')
@Grab('com.h2database:h2:1.4.197')
@Grab('org.im4java:im4java')

import groovy.sql.*
import groovy.util.*
import javax.imageio.*
import org.im4java.core.*

def defects = ['CRACK',                  // ひび割れ
               'EFFLORESCENCE',          // エフロレッセンス
               'DONT_CARE',              // 分析対象外
               'SPALLING',               // 剥離
               'POPOUT',                 // ポップアウト
               'SCALING',                // スケーリング
               'CHALK',                  // チョーク
               'WETTING',                // 濡れ
               'RUST_FLUID',             // 錆び汁
               'REINFORCEMENT_EXPOSURE', // 鉄筋露出
               'HONEY_COMB',             // 豆板
               'AIR_VOID',               // 表面気泡
               'STAIN_DISCOLORATION'     // 汚れ変色
]

def cli = new CliBuilder(usage:'ImageDiff.groovy image_filename image_filename2 defect_name')
def options = cli.parse(args)
if (options.arguments().size() != 3) {
    cli.usage()
    return
}

def filenames = [ options.arguments()[0], options.arguments()[1] ]
def defect = options.arguments()[2].toUpperCase()
assert defects.contains(defect)

println("filenames:$filenames, defect:$defect")

def RATE = 0.46
def squareSize = 2

// def sql = Sql.newInstance('jdbc:mysql://localhost:3306/ConcreteSlabAnnotator3?useSSL=false', 'annotator', 'annotator@keio', 'com.mysql.cj.jdbc.Driver')
def sql = Sql.newInstance('jdbc:h2:file:/home/u-ryo/tmp/concrete-slab-annotator-jhipster2/build/h2db/db/concreteslabannotator', 'ConcreteSlabAnnotator', '', 'org.h2.Driver')

def columns, rows, focalLength, distance, w, h

sql.eachRow('SELECT * FROM image WHERE filename LIKE ?', ['%' + filenames[0]]) { image ->
    w = image.width
    h = image.height
    focalLength = image.focal_length
    distance = image.distance
}

// println("$distance, $focalLength, $squareSize")

def rate = distance * RATE / focalLength / squareSize
columns = Math.round(rate * w)
rows = Math.round(rate * h)

def intervalX = w / columns
def intervalY = h / rows
def rectangles = []

filenames.eachWithIndex { f, i ->
    rectangles[i] = [:]
    sql.eachRow('SELECT r.coordinate_x,r.coordinate_y FROM rectangle r JOIN annotation a ON r.annotation_id=a.id JOIN image i ON a.image_id=i.id WHERE i.filename LIKE ? AND a.defect=? AND a.square_size=2', ['%' + f, defect]) { r ->
        def x = (r.coordinate_x * intervalX) as int
        def y = (r.coordinate_y * intervalY) as int
        def width = (x + intervalX) as int
        def height = (y + intervalY) as int
        rectangles[i][r.coordinate_x, r.coordinate_y] = [x, y, width, height]
    }
}

// println(rectangles)

imageFileName = ('locate ' + filenames[0]).execute().text ?: '/tmp/' + filenames[0]

op = new IMOperation().addImage(imageFileName.trim())
colors = ['rgba(178,76,77,0.6)','rgba(76,178,77,0.6)','rgba(77,76,178,0.6)']

rectangles.eachWithIndex { r, i ->
    op.fill(colors[i % colors.size()])
    op.stroke(colors[i % colors.size()])
    r.values().forEach { v ->
        op.draw("rectangle ${v[0]}, ${v[1]}, ${v[2]}, ${v[3]}")
    }
}

new ConvertCmd().run(
    op.quality(100.0)
        .strip()
        .addImage(imageFileName.trim()
                  .replace('.jpg', '_diff.jpg')
                  .replaceAll('.*/', '')))
