import Foundation
//     ^ type

// <- keyword

struct ABC: Codable {
    let a: [String] = ["Hello", "World!"]
    let b: Dictionary<String, Int> = ["One": 1, "Two": 2]
    var c: Bool = true
    var d: (String, Int) = ("", 0x123)
}

enum A: UInt32 {
    case a
    case b = 1
    case c = 2
}

func abc(def ghi: String, otherParameter: Bool) -> ABC {
    return ABC(a: ["String 1", "String 2"], b: ["Three": 3, "Four": 4], c: otherParameter)
}
